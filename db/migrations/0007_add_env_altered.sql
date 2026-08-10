-- Personal-story enrichment:
-- environment            : JSON array of element/environment sub-ids picked when
--                          'environment' is one of connection_types
-- altered_state          : single id ∈ {ordinary, meditation, psychedelic, dream,
--                          ritual, custom} — the state of mind during the experience
-- altered_state_detail   : free text qualifier (which psychedelic, type of meditation, …)

ALTER TABLE stories ADD COLUMN environment          TEXT;
ALTER TABLE stories ADD COLUMN altered_state        TEXT;
ALTER TABLE stories ADD COLUMN altered_state_detail TEXT;
