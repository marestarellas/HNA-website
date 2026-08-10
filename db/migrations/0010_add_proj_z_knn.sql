-- proj_z : third principal component (used for size encoding in constellation view)
-- knn    : JSON array of this story's top-3 nearest neighbours: [{"id":..., "score":...}, ...]
--          Used to render a faint k-NN graph across the canvas — turns the constellation
--          from "scatter plot" into "actual constellation."

ALTER TABLE stories ADD COLUMN proj_z REAL;
ALTER TABLE stories ADD COLUMN knn TEXT;
