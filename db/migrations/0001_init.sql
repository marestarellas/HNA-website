-- 0001_init.sql — initial schema for attuningtonature.earth
-- Conventions:
--   * IDs are TEXT (ULID/UUID, generated app-side) so we can sort by creation
--     time without exposing row counts.
--   * Timestamps are ISO-8601 strings (UTC) — easy to read in DB consoles, no
--     timezone ambiguity, sorts lexicographically.
--   * Questionnaire/experiment responses are stored long-format so adding or
--     removing items requires no migration.

PRAGMA foreign_keys = ON;

-- ============================================================================
-- Section 3 — Stories, Myths, and People (and Animals) of the Land
-- ============================================================================

CREATE TABLE stories (
    id                     TEXT PRIMARY KEY,
    kind                   TEXT NOT NULL CHECK (kind IN ('personal', 'folklore')),
    lat                    REAL,
    lng                    REAL,
    location_precision_km  REAL NOT NULL DEFAULT 0,  -- 0 = exact pin, >0 = fuzzed radius
    body_text              TEXT,                     -- written or transcribed
    audio_r2_key           TEXT,                     -- key into AUDIO_BUCKET
    transcript             TEXT,                     -- Whisper transcript (may differ from body_text)
    language               TEXT NOT NULL DEFAULT 'en',
    anon_handle            TEXT,                     -- optional self-chosen handle, never email
    status                 TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'published', 'flagged', 'deleted')),
    created_at             TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at             TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX stories_status_created ON stories(status, created_at DESC);
CREATE INDEX stories_kind           ON stories(kind);
CREATE INDEX stories_geo_published  ON stories(lat, lng) WHERE status = 'published';

-- Wheel-of-choice multi-select. (story_id, category, subcategory) is unique.
CREATE TABLE story_categories (
    story_id    TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    category    TEXT NOT NULL,   -- top-level: landscapes / organisms / forces / cycles
    subcategory TEXT NOT NULL,   -- e.g. 'forest', 'wind', 'dawn'
    detail      TEXT,            -- optional free-text: 'a specific oak', 'my dog Mira'
    PRIMARY KEY (story_id, category, subcategory)
);

CREATE INDEX story_categories_lookup ON story_categories(category, subcategory);

-- ============================================================================
-- Section 3 / 4 — Long-format questionnaire responses
-- Adding or removing items requires no migration — items are identified by
-- (instrument, item_key) and the schema makes no assumptions about them.
-- ============================================================================

CREATE TABLE questionnaire_responses (
    id            TEXT PRIMARY KEY,
    story_id      TEXT REFERENCES stories(id) ON DELETE SET NULL, -- nullable for standalone forms
    session_id    TEXT NOT NULL,                                  -- groups one sitting
    instrument    TEXT NOT NULL,                                  -- e.g. 'section3-place-memory'
    item_key      TEXT NOT NULL,                                  -- e.g. 'vividness'
    value_numeric REAL,
    value_text    TEXT,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX qr_session    ON questionnaire_responses(session_id);
CREATE INDEX qr_instrument ON questionnaire_responses(instrument, item_key);

-- ============================================================================
-- Section 4 — Experiment with generated stimuli
-- ============================================================================

CREATE TABLE stimuli (
    id                       TEXT PRIMARY KEY,
    r2_key                   TEXT NOT NULL,            -- key into STIMULI_BUCKET
    title                    TEXT,
    duration_s               REAL NOT NULL,
    media_type               TEXT NOT NULL,            -- 'video/mp4', 'video/webm', etc.
    generation_metadata_json TEXT,                     -- JSON: algorithm, seed, FD, oscillations
    enabled                  INTEGER NOT NULL DEFAULT 1,
    created_at               TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX stimuli_enabled ON stimuli(enabled);

CREATE TABLE experiment_sessions (
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

CREATE INDEX exp_sessions_started ON experiment_sessions(started_at DESC);

CREATE TABLE experiment_trials (
    id          TEXT PRIMARY KEY,
    session_id  TEXT NOT NULL REFERENCES experiment_sessions(id) ON DELETE CASCADE,
    stimulus_id TEXT NOT NULL REFERENCES stimuli(id),
    trial_index INTEGER NOT NULL,
    started_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ended_at    TEXT,
    skipped     INTEGER NOT NULL DEFAULT 0,
    UNIQUE (session_id, trial_index)
);

CREATE INDEX exp_trials_session ON experiment_trials(session_id, trial_index);

CREATE TABLE experiment_responses (
    id            TEXT PRIMARY KEY,
    trial_id      TEXT NOT NULL REFERENCES experiment_trials(id) ON DELETE CASCADE,
    item_key      TEXT NOT NULL,
    value_numeric REAL,
    value_text    TEXT,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX exp_responses_trial ON experiment_responses(trial_id);
