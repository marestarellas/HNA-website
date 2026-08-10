-- Attuning to Nature — initial schema.
-- Mirrors contribution_map_plan.md §3. JSON blobs for fields whose shape
-- will evolve (pheno, connection_types) so the science instrument can
-- change without migrations.

CREATE TABLE IF NOT EXISTS stories (
  id                 TEXT PRIMARY KEY,           -- uuid (client-generated or server-generated)
  created_at         INTEGER NOT NULL,           -- epoch ms

  lat                REAL    NOT NULL,
  lng                REAL    NOT NULL,
  location_label     TEXT,                       -- optional reverse-geocoded / user-typed

  -- the story (always present)
  text               TEXT    NOT NULL,           -- typed text, or transcript (possibly user-edited)
  text_long          TEXT,                       -- optional "say more" expansion
  source             TEXT    NOT NULL,           -- 'typed' | 'voice'

  -- voice metadata (NULL when source='typed')
  audio_key          TEXT,                       -- R2 object key
  audio_mime         TEXT,
  voice_visibility   TEXT,                       -- 'public' | 'transcript_only'

  -- demographics (bands, not raw, for privacy + science)
  age_band           TEXT,
  gender             TEXT,

  -- connection classification
  connection_types   TEXT,                       -- JSON array: ["environment","animal","plant"]
  connection_subject TEXT,                       -- which animal/plant/place, free text

  -- phenomenological dimensions (JSON; instrument may evolve)
  pheno              TEXT,                       -- JSON object: { scale_id: value, ... }

  -- lifecycle
  status             TEXT    NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  consent_version    TEXT    NOT NULL,
  lang               TEXT,                       -- declared or auto-detected
  submitter_ip_hash  TEXT                        -- hashed IP for rate-limit/dedup only, never returned
);

CREATE INDEX IF NOT EXISTS idx_stories_status     ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);
CREATE INDEX IF NOT EXISTS idx_stories_geo        ON stories(lat, lng);
