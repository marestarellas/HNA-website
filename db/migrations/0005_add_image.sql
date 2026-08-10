-- Image attachment for pareidolia stories (the face/figure/creature actually seen).
-- Stored in R2; only image_key and image_mime live in D1.
-- Other kinds leave both NULL.

ALTER TABLE stories ADD COLUMN image_key  TEXT;
ALTER TABLE stories ADD COLUMN image_mime TEXT;
