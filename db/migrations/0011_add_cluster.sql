-- cluster_id : k-means assignment over text_embedding. Used by the front-end
-- as one option in the "Color by" picker so emergent themes get a color.

ALTER TABLE stories ADD COLUMN cluster_id INTEGER;
