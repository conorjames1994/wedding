const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, url, caption FROM gallery_images ORDER BY sort_order, id');
    res.json(result.rows);
  } catch (err) {
    console.error('Loading gallery failed', err);
    res.status(500).json({ error: 'Could not load gallery.' });
  }
});

module.exports = router;
