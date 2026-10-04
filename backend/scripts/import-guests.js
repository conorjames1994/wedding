// Bulk-import your guest list from a CSV straight into Postgres.
//
// Usage:
//   npm run import-guests -- scripts/real-guests.csv
//
// One row per GUEST. Rows that share the same household_name are grouped into one
// household, which is what lets one person RSVP for their whole party.
//
// Columns (see scripts/guests.template.csv):
//   household_name   admin-only label, e.g. "Garry, Julie & Matthew Hirst" (blank = the guest's own name)
//   first_name       required
//   last_name        optional
//   age_category     "adult" or "child" (blank = adult)
//   email, phone     optional
//   notes            optional, shown nowhere on the public site

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
require('dotenv').config();
const pool = require('../src/db/pool');

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: npm run import-guests -- path/to/guests.csv');
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(csvPath), 'utf8');
  const rows = parse(raw, { columns: true, skip_empty_lines: true, trim: true, bom: true });

  if (rows.length === 0) {
    console.error('CSV has no rows.');
    process.exit(1);
  }

  // Group rows by household_name so everyone in a household lands under one record.
  const households = new Map();
  for (const row of rows) {
    const firstName = (row.first_name || '').trim();
    if (!firstName) {
      console.error(`Skipping row with no first_name: ${JSON.stringify(row)}`);
      continue;
    }
    const lastName = (row.last_name || '').trim() || null;
    const householdName =
      (row.household_name || '').trim() || [firstName, lastName].filter(Boolean).join(' ');
    const key = householdName.toLowerCase();

    if (!households.has(key)) {
      households.set(key, {
        householdName,
        email: row.email || null,
        phone: row.phone || null,
        notes: [],
        guests: [],
      });
    }
    const h = households.get(key);
    if (row.notes) h.notes.push(row.notes);
    h.guests.push({
      firstName,
      lastName,
      ageCategory: (row.age_category || 'adult').toLowerCase() === 'child' ? 'child' : 'adult',
    });
  }

  const totalGuests = [...households.values()].reduce((n, h) => n + h.guests.length, 0);
  console.log(`Found ${households.size} households with ${totalGuests} guests. Importing...\n`);

  const client = await pool.connect();
  let created = 0;
  let skipped = 0;

  try {
    for (const h of households.values()) {
      try {
        await client.query('BEGIN');

        const existing = await client.query(
          'SELECT id FROM households WHERE lower(household_name) = $1',
          [h.householdName.toLowerCase()]
        );
        if (existing.rows.length > 0) {
          console.log(`- Skipping "${h.householdName}" (already exists)`);
          await client.query('ROLLBACK');
          skipped++;
          continue;
        }

        const householdResult = await client.query(
          `INSERT INTO households (household_name, email, phone, notes, max_guests)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [h.householdName, h.email, h.phone, h.notes.join('; ') || null, h.guests.length]
        );
        const householdId = householdResult.rows[0].id;

        for (const g of h.guests) {
          await client.query(
            'INSERT INTO guests (household_id, first_name, last_name, age_category) VALUES ($1, $2, $3, $4)',
            [householdId, g.firstName, g.lastName, g.ageCategory]
          );
        }

        await client.query('COMMIT');
        console.log(`+ ${h.householdName} (${h.guests.length} guest${h.guests.length > 1 ? 's' : ''})`);
        created++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`! Failed to import "${h.householdName}": ${err.message}`);
      }
    }
  } finally {
    client.release();
  }

  console.log(`\nDone. ${created} household(s) created, ${skipped} skipped (already existed).`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
