-- Story kind taxonomy. All existing rows are personal stories.
-- Kinds: 'personal' | 'myth' | 'pareidolia'. See memory/story_kinds.md.

ALTER TABLE stories ADD COLUMN kind TEXT NOT NULL DEFAULT 'personal';

CREATE INDEX IF NOT EXISTS idx_stories_kind ON stories(kind);
