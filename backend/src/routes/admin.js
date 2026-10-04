const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../db/pool');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

// Simple local disk storage for dev. In production on Vercel (serverless, no persistent
// disk) swap this for an S3 / Cloudinary / Supabase Storage upload — see README.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

// POST /api/admin/login - just validates the password, lets the frontend confirm before storing it
router.post('/login', (req, res) => res.json({ success: true }));

// GET /api/admin/households - every household with their guests & RSVP status
router.get('/households', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT h.id AS household_id, h.household_name, h.email, h.phone, h.max_guests, h.notes,
             json_agg(json_build_object(
               'id', g.id, 'first_name', g.first_name, 'last_name', g.last_name,
               'age_category', g.age_category, 'attending', r.attending,
               'meal_choice', r.meal_choice, 'dietary_notes', r.dietary_notes,
               'song_request', r.song_request, 'responded_at', r.responded_at
             ) ORDER BY g.id) AS guests
      FROM households h
      LEFT JOIN guests g ON g.household_id = h.id
      LEFT JOIN rsvps r ON r.guest_id = g.id
      GROUP BY h.id
      ORDER BY h.household_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Loading households failed', err);
    res.status(500).json({ error: 'Could not load guest list.' });
  }
});

// POST /api/admin/households - add a new household + guests (for building out your guest list)
router.post('/households', async (req, res) => {
  const { householdName, email, phone, notes, guests } = req.body;
  if (!householdName || !Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({ error: 'householdName and at least one guest are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const householdResult = await client.query(
      `INSERT INTO households (household_name, email, phone, notes, max_guests)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [householdName, email || null, phone || null, notes || null, guests.length]
    );
    const householdId = householdResult.rows[0].id;

    for (const g of guests) {
      await client.query(
        'INSERT INTO guests (household_id, first_name, last_name, age_category) VALUES ($1, $2, $3, $4)',
        [householdId, g.firstName, g.lastName || null, g.ageCategory || 'adult']
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ householdId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Creating household failed', err);
    if (err.code === '23505') return res.status(409).json({ error: 'A household with that name already exists.' });
    res.status(500).json({ error: 'Could not create household.' });
  } finally {
    client.release();
  }
});

// GET /api/admin/export.csv - for handing off to your caterer/venue
router.get('/export.csv', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT h.household_name, g.first_name, g.last_name, g.age_category,
             COALESCE(r.attending::text, 'no response') AS attending,
             r.meal_choice, r.dietary_notes, r.song_request
      FROM guests g
      JOIN households h ON h.id = g.household_id
      LEFT JOIN rsvps r ON r.guest_id = g.id
      ORDER BY h.household_name, g.id
    `);

    const header = 'Household,First Name,Last Name,Age,Attending,Meal Choice,Dietary Notes,Song Request\n';
    const rows = result.rows
      .map((r) =>
        [r.household_name, r.first_name, r.last_name, r.age_category, r.attending, r.meal_choice, r.dietary_notes, r.song_request]
          .map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="rsvp-export.csv"');
    res.send(header + rows);
  } catch (err) {
    console.error('CSV export failed', err);
    res.status(500).json({ error: 'Could not export guest list.' });
  }
});

// POST /api/admin/gallery - upload a photo for the gallery section
router.post('/gallery', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const url = `/uploads/${req.file.filename}`;
  try {
    const result = await pool.query(
      'INSERT INTO gallery_images (url, caption) VALUES ($1, $2) RETURNING *',
      [url, req.body.caption || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Saving gallery image failed', err);
    res.status(500).json({ error: 'Could not save image.' });
  }
});

module.exports = router;
