-- ============================================================
-- AdFlow Pro — Complete Supabase Postgres Schema
-- Author: AdFlow Pro Team
-- Date: 2026-03-19
-- Description: Run this entire file in Supabase SQL Editor.
--   Creates all tables, indexes, seed data, and RLS policies.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'client'
                  CHECK (role IN ('client','moderator','admin','super_admin')),
  status        VARCHAR(20) NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','suspended','banned')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SELLER PROFILES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seller_profiles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name   VARCHAR(100),
  business_name  VARCHAR(150),
  phone          VARCHAR(20),
  city           VARCHAR(100),
  is_verified    BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PACKAGES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS packages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(50) NOT NULL,
  duration_days INTEGER NOT NULL,
  weight        INTEGER NOT NULL DEFAULT 1,
  is_featured   BOOLEAN DEFAULT FALSE,
  price         DECIMAL(10,2) NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CATEGORIES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(100) UNIQUE NOT NULL,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CITIES ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cities (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(100) UNIQUE NOT NULL,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ADS ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  package_id    UUID REFERENCES packages(id),
  category_id   UUID REFERENCES categories(id),
  city_id       UUID REFERENCES cities(id),
  title         VARCHAR(200) NOT NULL,
  slug          VARCHAR(260) UNIQUE NOT NULL,
  description   TEXT NOT NULL,
  price         DECIMAL(12,2),
  contact_phone VARCHAR(20),
  status        VARCHAR(30) NOT NULL DEFAULT 'draft'
                  CHECK (status IN (
                    'draft','submitted','under_review','payment_pending',
                    'payment_submitted','payment_verified','scheduled',
                    'published','expired','archived','rejected'
                  )),
  publish_at    TIMESTAMPTZ,
  expire_at     TIMESTAMPTZ,
  is_featured   BOOLEAN DEFAULT FALSE,
  admin_boost   INTEGER DEFAULT 0,
  rank_score    DECIMAL(10,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AD MEDIA ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_media (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id             UUID REFERENCES ads(id) ON DELETE CASCADE,
  source_type       VARCHAR(20) NOT NULL
                      CHECK (source_type IN ('image','youtube','cloudinary')),
  original_url      TEXT NOT NULL,
  thumbnail_url     TEXT,
  validation_status VARCHAR(20) DEFAULT 'pending'
                      CHECK (validation_status IN ('pending','valid','invalid')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PAYMENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id           UUID REFERENCES ads(id) ON DELETE CASCADE,
  amount          DECIMAL(10,2) NOT NULL,
  method          VARCHAR(50) NOT NULL,
  transaction_ref VARCHAR(100) UNIQUE,
  sender_name     VARCHAR(100),
  screenshot_url  TEXT,
  status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','verified','rejected')),
  admin_note      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(200) NOT NULL,
  message    TEXT NOT NULL,
  type       VARCHAR(20) DEFAULT 'info'
               CHECK (type IN ('info','success','warning','error')),
  is_read    BOOLEAN DEFAULT FALSE,
  link       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AD STATUS HISTORY ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_status_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id           UUID REFERENCES ads(id) ON DELETE CASCADE,
  previous_status VARCHAR(30),
  new_status      VARCHAR(30) NOT NULL,
  changed_by      UUID REFERENCES users(id),
  note            TEXT,
  changed_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LEARNING QUESTIONS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_questions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  topic      VARCHAR(100),
  difficulty VARCHAR(20) DEFAULT 'medium'
               CHECK (difficulty IN ('easy','medium','hard')),
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SYSTEM HEALTH LOGS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_health_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source      VARCHAR(50) NOT NULL,
  response_ms INTEGER,
  status      VARCHAR(20) DEFAULT 'ok'
                CHECK (status IN ('ok','slow','error')),
  checked_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_ads_status       ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_user_id      ON ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_category     ON ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_city         ON ads(city_id);
CREATE INDEX IF NOT EXISTS idx_ads_expire_at    ON ads(expire_at);
CREATE INDEX IF NOT EXISTS idx_ads_publish_at   ON ads(publish_at);
CREATE INDEX IF NOT EXISTS idx_ads_rank_score   ON ads(rank_score DESC);
CREATE INDEX IF NOT EXISTS idx_notif_user       ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_actor      ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_payments_ad      ON payments(ad_id);
CREATE INDEX IF NOT EXISTS idx_payments_ref     ON payments(transaction_ref);

-- ══════════════════════════════════════════════════════════════
-- SEED DATA
-- ══════════════════════════════════════════════════════════════

-- Packages
INSERT INTO packages (name, duration_days, weight, is_featured, price) VALUES
  ('Basic',    7,  1, FALSE, 500),
  ('Standard', 15, 2, FALSE, 1200),
  ('Premium',  30, 3, TRUE,  2500)
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO categories (name, slug) VALUES
  ('Real Estate',   'real-estate'),
  ('Vehicles',      'vehicles'),
  ('Electronics',   'electronics'),
  ('Jobs',          'jobs'),
  ('Services',      'services'),
  ('Fashion',       'fashion'),
  ('Home & Garden', 'home-garden'),
  ('Sports',        'sports')
ON CONFLICT (slug) DO NOTHING;

-- Cities
INSERT INTO cities (name, slug) VALUES
  ('Karachi',    'karachi'),
  ('Lahore',     'lahore'),
  ('Islamabad',  'islamabad'),
  ('Faisalabad', 'faisalabad'),
  ('Rawalpindi', 'rawalpindi'),
  ('Multan',     'multan'),
  ('Peshawar',   'peshawar'),
  ('Quetta',     'quetta')
ON CONFLICT (slug) DO NOTHING;

-- Learning questions
INSERT INTO learning_questions (question, answer, topic, difficulty) VALUES
  ('What does MERN stand for?', 'MongoDB, Express.js, React, and Node.js — a popular full-stack JavaScript framework combination.', 'Web Dev', 'easy'),
  ('What is Row Level Security (RLS) in Postgres?', 'RLS allows database administrators to define policies that control access to table rows based on the current user, providing fine-grained security.', 'Database', 'medium'),
  ('What is the purpose of JWT?', 'JSON Web Tokens are used to securely transmit information between parties as a compact, self-contained token that can be verified and trusted.', 'Security', 'easy'),
  ('What is a rank score in search systems?', 'A computed numeric score that determines the position of a result in a listing. Higher scores appear first. Factors include relevance, freshness, and boosters.', 'Search', 'medium'),
  ('What is a webhook?', 'A webhook is an HTTP callback that notifies an application when a specific event occurs in another system, enabling real-time data flow.', 'APIs', 'easy'),
  ('What does Zod do in a Node.js app?', 'Zod is a TypeScript-first schema validation library that validates and parses data at runtime, providing type safety end-to-end.', 'Backend', 'easy'),
  ('What is ISR in Next.js?', 'Incremental Static Regeneration allows pages to be statically generated and then re-generated on-demand or on a time interval without a full rebuild.', 'Next.js', 'medium'),
  ('What is the difference between bcrypt and MD5?', 'bcrypt is a slow, adaptive hashing algorithm designed for passwords. MD5 is a fast cryptographic hash not suitable for passwords as it can be brute-forced quickly.', 'Security', 'medium')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════
-- Enable RLS on user-facing tables
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_media          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;

-- Public read policies (our server client bypasses RLS via service key)
-- These allow anon reads on public data for the browser Supabase client
CREATE POLICY "Public read packages"  ON packages  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read cities"    ON cities    FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read questions" ON learning_questions FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read health"    ON system_health_logs FOR SELECT TO anon USING (TRUE);

-- ══════════════════════════════════════════════════════════════
-- DONE — AdFlow Pro schema installed successfully
-- ══════════════════════════════════════════════════════════════
