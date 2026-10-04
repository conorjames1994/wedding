const express = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../db/pool');

const router = express.Router();

// There's no invite code any more, so these endpoints are public. A rate limit stops
// anyone from hammering the search to scrape the guest list.
router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests — please wait a few minutes and try again.' },
  })
);

// POST /api/rsvp/search { name }
// Finds guests whose name matches what the person typed. Every word typed must appear
// somewhere in "first last", so "hannah h", "hirst" and "Hannah Hirst" all work.
router.post('/search', async (req, res) => {
  const raw = (req.body.name || '').toString().trim();
  const tokens = raw.split(/\s+/).filter((t) => t.length >= 2).slice(0, 4);

  if (tokens.length === 0) {
    return res.status(400).json({ error: 'Please type at least 2 letters of your name.' });
  }

  // Escape LIKE wildcards so someone typing "%" doesn't match everybody.
  const params = tokens.map((t) => `%${t.replace(/[\\%_]/g, '\\$&')}%`);
  const conditions = params
    .map((_, i) => `(g.first_name || ' ' || COALESCE(g.last_name, '')) ILIKE $${i + 1}`)
    .join(' AND ');

  try {
    const result = await pool.query(
      `SELECT g.id, g.first_name, g.last_name, g.household_id
       FROM guests g
       WHERE ${conditions}
       ORDER BY g.first_name, g.last_name
       LIMIT 8`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error('RSVP search failed', err);
    res.status(500).json({ error: 'Something went wrong searching for your name.' });
  }
});

// GET /api/rsvp/household/:id
// Returns everyone in that household (and any answers already given) so one person
// can RSVP for their whole party.
router.get('/household/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid household' });
  }

  try {
    const householdResult = await pool.query('SELECT id FROM households WHERE id = $1', [id]);
    if (householdResult.rows.length === 0) {
      return res.status(404).json({ error: "We couldn't find that invite." });
    }

    const guestsResult = await pool.query(
      `SELECT g.id, g.first_name, g.last_name, g.age_category,
              r.attending, r.meal_choice, r.dietary_notes, r.song_request
       FROM guests g
       LEFT JOIN rsvps r ON r.guest_id = g.id
       WHERE g.household_id = $1
       ORDER BY g.id`,
      [id]
    );

    res.json({ household: householdResult.rows[0], guests: guestsResult.rows });
  } catch (err) {
    console.error('Household lookup failed', err);
    res.status(500).json({ error: 'Something went wrong loading your invite.' });
  }
});

// POST /api/rsvp/submit
// { householdId, responses: [{ guestId, attending, mealChoice, dietaryNotes, songRequest }] }
router.post('/submit', async (req, res) => {
  const { householdId, responses } = req.body;

  if (!householdId || !Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ error: 'householdId and responses are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Make sure every guestId actually belongs to this household before writing anything.
    const guestIds = responses.map((r) => r.guestId);
    const ownershipCheck = await client.query(
      'SELECT id FROM guests WHERE household_id = $1 AND id = ANY($2::int[])',
      [householdId, guestIds]
    );
    if (ownershipCheck.rows.length !== guestIds.length) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'One or more guests do not belong to this invite.' });
    }

    for (const r of responses) {
      await client.query(
        `INSERT INTO rsvps (guest_id, attending, meal_choice, dietary_notes, song_request, responded_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (guest_id)
         DO UPDATE SET attending = $2, meal_choice = $3, dietary_notes = $4, song_request = $5, responded_at = now()`,
        [r.guestId, !!r.attending, r.mealChoice || null, r.dietaryNotes || null, r.songRequest || null]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('RSVP submit failed', err);
    res.status(500).json({ error: 'Something went wrong saving your RSVP.' });
  } finally {
    client.release();
  }
});

module.exports = router;
