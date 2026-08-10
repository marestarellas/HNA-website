-- One row per scope, holding the model artifacts needed to project + cluster
-- a freshly-embedded story in real time, without re-running the full recompute.
--
-- Scopes used:
--   'pca'                — { mean: [...1024], components: [[pc1], [pc2], [pc3]], ranges: [[lo,hi],[lo,hi],[lo,hi]] }
--   'kmeans_all'         — { centroids: [[1024 floats]; 8] }              (L2-normalized)
--   'kmeans_personal'    — { centroids: [[1024 floats]; k] }              (L2-normalized)
--   'kmeans_myth'        — { centroids: [[1024 floats]; k] }              (L2-normalized)
--   'kmeans_pareidolia'  — { centroids: [[1024 floats]; k] }              (L2-normalized)
--
-- Written by POST /api/admin/recompute-projection; read by POST /api/stories
-- after the new submission's text is embedded.

CREATE TABLE IF NOT EXISTS projection_meta (
  scope       TEXT    PRIMARY KEY,
  data        TEXT    NOT NULL,
  updated_at  INTEGER NOT NULL
);
