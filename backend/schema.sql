-- ============================================================
-- Predictnest – Supabase PostgreSQL Schema
-- Run this in your Supabase project's SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  phone       VARCHAR(30),
  role        VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user','admin')),
  avatar      TEXT DEFAULT '',
  saved_rooms UUID[] DEFAULT ARRAY[]::UUID[],
  preferences JSONB DEFAULT '{}'::JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- LANDLORDS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS landlords (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255),
  contact    VARCHAR(30) NOT NULL,
  verified   BOOLEAN DEFAULT FALSE,
  properties UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ROOMS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          VARCHAR(200) NOT NULL,
  description    TEXT NOT NULL,
  location       JSONB NOT NULL,
  price          NUMERIC NOT NULL CHECK (price >= 0),
  amenities      TEXT[] DEFAULT ARRAY[]::TEXT[],
  images         TEXT[] DEFAULT ARRAY[]::TEXT[],
  landlord_id    UUID REFERENCES landlords(id) ON DELETE SET NULL,
  availability   BOOLEAN DEFAULT TRUE,
  room_type      VARCHAR(20) DEFAULT 'single'
                   CHECK (room_type IN ('single','double','shared','studio','apartment')),
  furnishing     VARCHAR(20) DEFAULT 'semi-furnished'
                   CHECK (furnishing IN ('furnished','semi-furnished','unfurnished')),
  reviews        JSONB DEFAULT '[]'::JSONB,
  average_rating NUMERIC DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  room_id    UUID REFERENCES rooms(id) ON DELETE CASCADE,
  visit_date TIMESTAMPTZ NOT NULL,
  status     VARCHAR(20) DEFAULT 'pending'
               CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_rooms_city       ON rooms USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_rooms_price      ON rooms (price);
CREATE INDEX IF NOT EXISTS idx_rooms_amenities  ON rooms USING GIN (amenities);
CREATE INDEX IF NOT EXISTS idx_rooms_landlord   ON rooms (landlord_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user    ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room    ON bookings (room_id);

-- ─────────────────────────────────────────
-- DISABLE ROW LEVEL SECURITY (backend uses service key)
-- ─────────────────────────────────────────
ALTER TABLE users      DISABLE ROW LEVEL SECURITY;
ALTER TABLE landlords  DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms      DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings   DISABLE ROW LEVEL SECURITY;
