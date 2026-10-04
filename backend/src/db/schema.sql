-- Wedding website schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS households (
  id SERIAL PRIMARY KEY,
  household_name VARCHAR(120) NOT NULL,      -- admin-only label, e.g. "Garry, Julie & Matthew Hirst"
  email VARCHAR(160),
  phone VARCHAR(40),
  max_guests INTEGER NOT NULL DEFAULT 1,     -- number of people in this household
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80),
  age_category VARCHAR(10) NOT NULL DEFAULT 'adult' CHECK (age_category IN ('adult', 'child')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rsvps (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER NOT NULL UNIQUE REFERENCES guests(id) ON DELETE CASCADE,
  attending BOOLEAN,                         -- null = not yet responded
  meal_choice VARCHAR(60),
  dietary_notes TEXT,
  song_request VARCHAR(160),
  responded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  household_id INTEGER REFERENCES households(id) ON DELETE SET NULL,
  guest_name VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT true,    -- flip to false if you want to moderate before showing publicly
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  caption VARCHAR(200),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Upgrade for databases created with the older invite-code version of this schema
-- (safe to re-run: does nothing if the column is already gone)
ALTER TABLE households DROP COLUMN IF EXISTS invite_code;
CREATE UNIQUE INDEX IF NOT EXISTS idx_households_name ON households (lower(household_name));

CREATE INDEX IF NOT EXISTS idx_guests_household ON guests(household_id);
CREATE INDEX IF NOT EXISTS idx_messages_approved ON messages(approved);

