-- À exécuter une fois dans l’éditeur SQL Neon (ou psql) avant d’utiliser la table côté code.
-- Exemple de table clé / JSON pour une future migration depuis waxtu-cms.json.

CREATE TABLE IF NOT EXISTS waxtu_meta (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
