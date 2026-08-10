-- 0014 — questionnaire + experiment tables.
--
-- HISTORY: this was originally `0001_init.sql` in this repo, written during
-- bootstrap but never applied — the D1 `database_id` was still a placeholder,
-- so no database ever ran it. Migrations 0001–0013 come from the Attuning to
-- Nature map prototype and ARE applied to the live `attuning_to_nature` D1,
-- so they keep their original numbering. This file was renumbered to 0014 to
-- sit after them.
--
-- The original 0001 also defined `stories` and `story_categories`. Both are
-- dropped here:
--   * `stories` — 0001_init.sql (prototype) owns it. That version is live,
--     carries embeddings/projection/cluster columns, and uses the richer
--     `personal | myth | pareidolia` vocabulary rather than `personal | folklore`.
--   * `story_categories` — the prototype models this as JSON on the story row
--     (`connection_types` + `connection_subject`). A join table is only worth
--     adding back when the aggregate views ("stories of the wind") are built
--     and actually need to index it; an unused table would just rot.
--
-- Note: the original had `PRAGMA foreign_keys = ON`. Dropped — it is per
-- connection, and D1 gives each migration statement its own, so it did nothing.
-- D1 enforces foreign keys by default.

-- ============================================================================
-- Section 3 / 4 — Long-format questionnaire responses
-- Adding or removing items requires no migration — items are identified by
-- (instrument, item_key) and the schema makes no assumptions about them.
-- ============================================================================

CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id            TEXT PRIMARY KEY,
    story_id      TEXT REFERENCES stories(id) ON DELETE SET NULL, -- nullable for standalone forms
    session_id    TEXT NOT NULL,                                  -- groups one sitting
    instrument    TEXT NOT NULL,                                  -- e.g. 'section3-place-memory'
    item_key      TEXT NOT NULL,                                  -- e.g. 'vividness'
    value_numeric REAL,
    value_text    TEXT,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS qr_session    ON questionnaire_responses(session_id);
CREATE INDEX IF NOT EXISTS qr_instrument ON questionnaire_responses(instrument, item_key);

-- ============================================================================
-- Section 4 — Experiment with generated stimuli
-- ============================================================================

CREATE TABLE IF NOT EXISTS stimuli (
    id                       TEXT PRIMARY KEY,
    r2_key                   TEXT NOT NULL,            -- key into STIMULI_BUCKET
    title                    TEXT,
    duration_s               REAL NOT NULL,
    media_type               TEXT NOT NULL,            -- 'video/mp4', 'video/webm', etc.
    generation_metadata_json TEXT,                     -- JSON: algorithm, seed, FD, oscillations
    enabled                  INTEGER NOT NULL DEFAULT 1,
    created_at               TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS stimuli_enabled ON stimuli(enabled);

CREATE TABLE IF NOT EXISTS experiment_sessions (
    id                  TEXT PRIMARY KEY,
    consent_version     TEXT NOT NULL,                              -- which consent text was agreed to
    sequencing_strategy TEXT NOT NULL DEFAULT 'random',             -- 'random' | 'balanced' | 'adaptive'
    ua_hash             TEXT,                                       -- one-way hash, never raw UA
    locale              TEXT,
    started_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    completed_at        TEXT,
    abandoned_at        TEXT,
    notes               TEXT
);

CREATE INDEX IF NOT EXISTS exp_sessions_started ON experiment_sessions(started_at DESC);

CREATE TABLE IF NOT EXISTS experiment_trials (
    id          TEXT PRIMARY KEY,
    session_id  TEXT NOT NULL REFERENCES experiment_sessions(id) ON DELETE CASCADE,
    stimulus_id TEXT NOT NULL REFERENCES stimuli(id),
    trial_index INTEGER NOT NULL,
    started_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ended_at    TEXT,
    skipped     INTEGER NOT NULL DEFAULT 0,
    UNIQUE (session_id, trial_index)
);

CREATE INDEX IF NOT EXISTS exp_trials_session ON experiment_trials(session_id, trial_index);

CREATE TABLE IF NOT EXISTS experiment_responses (
    id            TEXT PRIMARY KEY,
    trial_id      TEXT NOT NULL REFERENCES experiment_trials(id) ON DELETE CASCADE,
    item_key      TEXT NOT NULL,
    value_numeric REAL,
    value_text    TEXT,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS exp_responses_trial ON experiment_responses(trial_id);
