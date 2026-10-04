const express = require('express');
const cors = require('cors');
const path = require('path');

const rsvpRoutes = require('./routes/rsvp');
const guestbookRoutes = require('./routes/guestbook');
const adminRoutes = require('./routes/admin');
const galleryRoutes = require('./routes/gallery');

const app = express();

// Railway/Render sit behind a proxy; this lets the rate limiter see each guest's real IP.
app.set('trust proxy', 1);

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/rsvp', rsvpRoutes);
app.use('/api/messages', guestbookRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);

// Generic error handler (e.g. multer file-type errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Something went wrong' });
});

module.exports = app;
