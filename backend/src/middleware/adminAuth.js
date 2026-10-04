// Deliberately simple: this is a two-person wedding site, not a multi-tenant SaaS app.
// The couple shares one admin password (set via env var) and it's sent as a header.
// Good enough for this use case; swap for real auth if you ever need more than one admin.

module.exports = function adminAuth(req, res, next) {
  const suppliedPassword = req.header('x-admin-password');

  if (!process.env.ADMIN_PASSWORD) {
    console.warn('ADMIN_PASSWORD is not set — admin routes are unprotected!');
    return next();
  }

  if (suppliedPassword && suppliedPassword === process.env.ADMIN_PASSWORD) {
    return next();
  }

  return res.status(401).json({ error: 'Invalid admin password' });
};
