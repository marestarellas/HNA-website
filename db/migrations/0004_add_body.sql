-- Body-sensation marks for the Personal story flow.
-- JSON-encoded array of up to 3 entries: [{ region, sensation, custom? }, …].
-- Personal-only in v1; other kinds leave it NULL. See memory/body_dimension.md.

ALTER TABLE stories ADD COLUMN body TEXT;
