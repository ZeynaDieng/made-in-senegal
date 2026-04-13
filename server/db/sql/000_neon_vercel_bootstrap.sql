-- À exécuter une fois dans Neon (SQL Editor) avant admin / contact persistants sur Vercel.
-- = 001_waxtu_meta.sql + 002_contact_leads.sql

CREATE TABLE IF NOT EXISTS waxtu_meta (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS waxtu_contact_leads (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL
);

CREATE INDEX IF NOT EXISTS waxtu_contact_leads_created_at_idx ON waxtu_contact_leads (created_at DESC);
