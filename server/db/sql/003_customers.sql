-- Espace client (comptes + favoris + points fidélité).
-- Production Vercel : pas d’écriture disque dans .data/ → utiliser Neon.

CREATE TABLE IF NOT EXISTS waxtu_customers (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  favorite_product_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  loyalty_points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS waxtu_customers_created_at_idx ON waxtu_customers (created_at DESC);
CREATE INDEX IF NOT EXISTS waxtu_customers_email_idx ON waxtu_customers (email);

