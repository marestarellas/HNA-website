-- Cluster scopes:
--   'all'        — global k-means over the whole approved corpus
--   'personal'   — k-means within personal-kind stories only
--   'myth'       — k-means within myth-kind stories only
--   'pareidolia' — k-means within pareidolia-kind stories only
--
-- Within-kind cluster assignment is denormalized onto the story row
-- so the front-end can color pins by either global or within-kind cluster
-- without an extra round-trip.

CREATE TABLE IF NOT EXISTS clusters (
  scope       TEXT    NOT NULL,
  id          INTEGER NOT NULL,
  label       TEXT,                -- LLM-generated, may change between recomputes
  manual      TEXT,                -- human override; if present, always wins over `label`
  size        INTEGER,
  updated_at  INTEGER NOT NULL,
  PRIMARY KEY (scope, id)
);

ALTER TABLE stories ADD COLUMN cluster_id_kind INTEGER;
