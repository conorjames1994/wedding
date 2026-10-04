const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /api/messages - public wall, only approved messages
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, guest_name, message, created_at FROM messages WHERE approved = true ORDER BY created_at DESC LIMIT 200'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetching messages failed', err);
    res.status(500).json({ error: 'Could not load messages.' });
  }
});

// POST /api/messages { guestName, message, householdId? }
router.post('/', async (req, res) => {
  const { guestName, message, householdId } = req.body;

  if (!guestName?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'guestName and message are required' });
  }
  if (message.length > 1000) {
    return res.status(400).json({ error: 'Message is too long (max 1000 characters).' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO messages (household_id, guest_name, message) VALUES ($1, $2, $3) RETURNING id, guest_name, message, created_at',
      [householdId || null, guestName.trim(), message.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Posting message failed', err);
    res.status(500).json({ error: 'Could not post your message.' });
  }
});

module.exports = router;
