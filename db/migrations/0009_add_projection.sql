-- 2D projection of text_embedding (plan step 6, phase B — constellation view).
-- Recomputed in bulk by POST /api/admin/recompute-projection.
-- Stories without a projection are simply absent from the constellation view.

ALTER TABLE stories ADD COLUMN proj_x REAL;
ALTER TABLE stories ADD COLUMN proj_y REAL;
