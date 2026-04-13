-- Messages du formulaire contact (production Vercel : pas d’écriture disque dans .data/).

CREATE TABLE IF NOT EXISTS waxtu_contact_leads (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL
);

CREATE INDEX IF NOT EXISTS waxtu_contact_leads_created_at_idx ON waxtu_contact_leads (created_at DESC);
