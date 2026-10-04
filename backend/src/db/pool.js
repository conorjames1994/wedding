const { Pool } = require('pg');

// Works with a single DATABASE_URL (Supabase, Neon, Railway, Render all provide one)
// or discrete PG* env vars if you prefer.
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
      }
    : {
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'wedding',
      }
);

module.exports = pool;
