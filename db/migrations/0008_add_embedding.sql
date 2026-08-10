-- Text embedding storage for the resonance feature (plan step 6, phase A).
-- bge-m3 returns 1024 floats; we serialize as JSON.
--
-- In production this column is technically redundant — Vectorize is the
-- authoritative store. But keeping a copy in D1 gives us a local-dev path
-- (no Vectorize binding) and a simple way to rebuild Vectorize after wipe.

ALTER TABLE stories ADD COLUMN text_embedding TEXT;
CREATE INDEX IF NOT EXISTS idx_stories_has_embedding
  ON stories(status) WHERE text_embedding IS NOT NULL;
