/**
 * Attuning to Nature — Stories API
 *
 * A Hono app serving everything under /api. It is NOT the Worker entrypoint:
 * the site is a Next.js app built by OpenNext, so this mounts inside the
 * catch-all route handler at `src/app/api/[[...route]]/route.ts`, which hands
 * it the Cloudflare `env` and `ctx`. Keeping it as one Hono app (rather than a
 * tree of Next route handlers) preserves the routing and the ML pipeline below
 * exactly as they were built and tested in the standalone prototype.
 *
 * Routes:
 *  - GET  /api/health
 *  - GET  /api/stories              approved pins for the public map (optional bbox)
 *  - GET  /api/stories/:id          full approved story
 *  - POST /api/stories              create, status='pending', consent + rate-limited
 *  - GET  /api/stories/:id/resonant nearest neighbours in embedding space
 *  - GET  /api/clusters             LLM-named cluster labels, by scope
 *  - POST /api/transcribe           Whisper + R2
 *  - POST /api/images               pareidolia photo upload
 *  - GET  /api/images/img/:filename
 *  - GET  /api/audio/audio/:filename  gated by voice_visibility
 *  - POST /api/admin/*              recompute projection, backfill, re-integrate
 *
 * NOTE: there is no CORS middleware. The API is same-origin with the site now;
 * the prototype's `origin: "*"` policy was for cross-port local dev only and
 * would be an unnecessary hole in production.
 */

import { Hono } from "hono";

export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  AI: Ai;
  VECTORIZE_TEXT: VectorizeIndex;
  RL_STORIES: RateLimit;
  CONSENT_VERSION: string;
}

const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Audio mimes we accept from the front-end MediaRecorder + common upload formats.
// Whisper is content-sniffed by the model, so we mostly care that the mime is plausible.
const AUDIO_MIMES = new Set([
  "audio/webm", "audio/ogg", "audio/wav", "audio/x-wav",
  "audio/mp4", "audio/mpeg", "audio/m4a", "audio/aac", "audio/flac",
]);
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;
function audioExt(mime: string): string {
  if (mime === "audio/webm") return "webm";
  if (mime === "audio/ogg")  return "ogg";
  if (mime === "audio/wav" || mime === "audio/x-wav") return "wav";
  if (mime === "audio/mp4" || mime === "audio/m4a")   return "m4a";
  if (mime === "audio/mpeg") return "mp3";
  if (mime === "audio/aac")  return "aac";
  if (mime === "audio/flac") return "flac";
  return "bin";
}

type Bindings = Env;
const app = new Hono<{ Bindings: Bindings }>();

/* ============================================================================
 * Helpers
 * ========================================================================== */

const uid = () => crypto.randomUUID();

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip") ||
         req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
         "0.0.0.0";
}

const AGE_BANDS = new Set(["under 18", "18–24", "25–34", "35–44", "45–54", "55–64", "65+"]);
const GENDERS   = new Set(["woman", "man", "non-binary", "other", "prefer not to say"]);
const SOURCES   = new Set(["typed", "voice"]);
const VOICE_VIS = new Set(["public", "transcript_only"]);
// Union of all per-kind connection-type ids. Keeping it as one flat set
// keeps the schema simple (a JSON array of short ids in D1) while still
// rejecting typos at the API boundary.
const CONN_TYPES = new Set([
  // personal
  "environment", "animal", "plant",
  // myth — also reuses animal, plant
  "place", "being", "element", "sky",
  // pareidolia — also reuses plant
  "tree", "cloud", "water", "stone", "earth",
]);
const KINDS     = new Set(["personal", "myth", "pareidolia"]);
const ENVIRONMENT_IDS = new Set([
  // elements
  "air", "soil", "water", "fire",
  // environments / biomes
  "forest", "sea", "desert", "mountain", "river", "lake",
  "cave", "meadow", "wetland", "sky", "snow", "island", "volcano",
]);
const ALTERED_STATES = new Set([
  "ordinary", "meditation", "psychedelic", "dream", "ritual", "custom",
]);
const BODY_REGIONS = new Set([
  "head", "throat", "chest", "heart", "solar", "belly", "pelvis",
  "arms", "hands", "legs", "feet",
]);
const SENSATIONS = new Set([
  "warmth", "tingling", "tickling", "lightness", "coolness",
  "pressure", "pulsing", "tightness", "custom",
]);
const MAX_BODY_MARKS = 3;

type BodyMark = { region: string; sensations: string[]; custom?: string };
type StoryInput = {
  id?: string;
  kind: "personal" | "myth" | "pareidolia";
  lat: number;
  lng: number;
  location_label?: string | null;
  text: string;
  text_long?: string | null;
  source: "typed" | "voice";
  audio_key?: string | null;
  audio_mime?: string | null;
  voice_visibility?: "public" | "transcript_only" | null;
  image_key?: string | null;
  image_mime?: string | null;
  age_band?: string;
  gender?: string;
  connection_types?: string[];
  connection_subject?: string;
  environment?: string[];
  altered_state?: string | null;
  altered_state_detail?: string | null;
  pheno?: Record<string, number>;
  body?: BodyMark[];
  consent_version: string;
  consent: boolean;
  lang?: string | null;
};

function validate(body: any): { ok: true; data: StoryInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "body must be an object" };

  const lat = Number(body.lat), lng = Number(body.lng);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90)   return { ok: false, error: "lat out of range" };
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return { ok: false, error: "lng out of range" };

  const text = String(body.text ?? "").trim();
  if (text.length < 3)    return { ok: false, error: "text too short" };
  if (text.length > 4000) return { ok: false, error: "text too long" };

  const source = String(body.source ?? "typed");
  if (!SOURCES.has(source)) return { ok: false, error: "source must be 'typed' or 'voice'" };

  const kind = String(body.kind ?? "personal");
  if (!KINDS.has(kind)) return { ok: false, error: "kind must be 'personal', 'myth', or 'pareidolia'" };

  if (body.age_band && !AGE_BANDS.has(body.age_band)) return { ok: false, error: "invalid age_band" };
  if (body.gender   && !GENDERS.has(body.gender))     return { ok: false, error: "invalid gender" };

  const conn = Array.isArray(body.connection_types) ? body.connection_types : [];
  for (const c of conn) if (!CONN_TYPES.has(c)) return { ok: false, error: `invalid connection_type: ${c}` };

  const env: string[] = [];
  if (Array.isArray(body.environment)) {
    for (const e of body.environment) {
      if (typeof e === "string" && ENVIRONMENT_IDS.has(e)) env.push(e);
    }
  }

  let altered: string | null = null;
  if (body.altered_state != null) {
    const a = String(body.altered_state);
    if (!ALTERED_STATES.has(a)) return { ok: false, error: `invalid altered_state: ${a}` };
    altered = a;
  }
  const alteredDetail = body.altered_state_detail
    ? String(body.altered_state_detail).slice(0, 200).trim() || null
    : null;

  if (source === "voice") {
    if (body.voice_visibility && !VOICE_VIS.has(body.voice_visibility)) {
      return { ok: false, error: "invalid voice_visibility" };
    }
  }

  if (body.consent !== true) return { ok: false, error: "consent must be explicit (true)" };
  if (!body.consent_version) return { ok: false, error: "consent_version required" };

  // pheno is freeform JSON object, numeric values 0..4. Just bound the keys/values.
  const pheno: Record<string, number> = {};
  if (body.pheno && typeof body.pheno === "object") {
    for (const [k, v] of Object.entries(body.pheno)) {
      if (typeof k === "string" && k.length <= 40 && typeof v === "number" && v >= 0 && v <= 10) {
        pheno[k] = v;
      }
    }
  }

  // Body sensations — up to MAX_BODY_MARKS marks per body; each mark is
  // { region, sensations: string[], custom? }. We accept the legacy shape
  // ({region, sensation, custom?}) too so older clients keep working.
  const bodyMarks: BodyMark[] = [];
  if (Array.isArray(body.body)) {
    for (const raw of body.body.slice(0, MAX_BODY_MARKS)) {
      if (!raw || typeof raw !== "object") continue;
      const region = String(raw.region ?? "");
      if (!BODY_REGIONS.has(region)) continue;
      const inSens: unknown[] = Array.isArray(raw.sensations)
        ? raw.sensations
        : (raw.sensation != null ? [raw.sensation] : []);
      const sensations: string[] = [];
      for (const s of inSens) {
        const str = String(s);
        if (SENSATIONS.has(str) && !sensations.includes(str)) sensations.push(str);
        if (sensations.length >= 8) break;
      }
      if (sensations.length === 0) continue;
      const mark: BodyMark = { region, sensations };
      if (raw.custom != null) {
        const c = String(raw.custom).slice(0, 80).trim();
        if (c) mark.custom = c;
      }
      bodyMarks.push(mark);
    }
  }

  return {
    ok: true,
    data: {
      id: typeof body.id === "string" && body.id.length <= 64 ? body.id : undefined,
      kind: kind as "personal" | "myth" | "pareidolia",
      lat, lng,
      location_label:     body.location_label     ? String(body.location_label).slice(0, 200) : null,
      text,
      text_long:          body.text_long          ? String(body.text_long).slice(0, 8000)    : null,
      source: source as "typed" | "voice",
      audio_key:          body.audio_key          ? String(body.audio_key).slice(0, 200)     : null,
      audio_mime:         body.audio_mime         ? String(body.audio_mime).slice(0, 80)     : null,
      voice_visibility:   body.voice_visibility   ?? null,
      image_key:          body.image_key          ? String(body.image_key).slice(0, 200)     : null,
      image_mime:         body.image_mime         ? String(body.image_mime).slice(0, 80)     : null,
      age_band:           body.age_band           ?? undefined,
      gender:             body.gender             ?? undefined,
      connection_types:   conn,
      connection_subject: body.connection_subject ? String(body.connection_subject).slice(0, 200) : undefined,
      environment:        env,
      altered_state:      altered,
      altered_state_detail: alteredDetail,
      pheno,
      body:               bodyMarks,
      consent_version:    String(body.consent_version).slice(0, 40),
      consent:            true,
      lang:               body.lang               ? String(body.lang).slice(0, 16)            : null,
    },
  };
}

/* ============================================================================
 * Routes
 * ========================================================================== */

app.get("/api/health", (c) => c.json({ ok: true, consent_version: c.env.CONSENT_VERSION }));

/**
 * GET /api/clusters
 * Returns all cluster labels (global + per-kind), grouped by scope.
 *   { items: { scope: [{ id, label, size, manual }, ...] } }
 * `manual` wins over `label` when rendering.
 */
app.get("/api/clusters", async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT scope, id, label, manual, size, updated_at FROM clusters ORDER BY scope, id`
  ).all<any>();
  const grouped: Record<string, any[]> = {};
  for (const r of rows.results ?? []) {
    (grouped[r.scope] ||= []).push({
      id: r.id,
      label: r.manual || r.label || null,
      size: r.size,
      manual: !!r.manual,
    });
  }
  return c.json({ items: grouped });
});

/**
 * GET /api/stories?bbox=west,south,east,north
 * Public list: only status='approved'. Never returns audio_key.
 */
app.get("/api/stories", async (c) => {
  const bbox = c.req.query("bbox");
  const limit = Math.min(Number(c.req.query("limit") ?? 500), 2000);

  let sql =
    `SELECT id, kind, lat, lng, proj_x, proj_y, proj_z, knn, cluster_id, cluster_id_kind,
            location_label, connection_types,
            substr(text, 1, 140) AS snippet, source, image_key, created_at
     FROM stories WHERE status = 'approved'`;
  const args: unknown[] = [];

  if (bbox) {
    const parts = bbox.split(",").map(Number);
    if (parts.length === 4 && parts.every(Number.isFinite)) {
      const [west, south, east, north] = parts;
      sql += ` AND lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?`;
      args.push(south, north, west, east);
    }
  }
  sql += ` ORDER BY created_at DESC LIMIT ?`;
  args.push(limit);

  const rows = await c.env.DB.prepare(sql).bind(...args).all();
  const items = (rows.results ?? []).map((r: any) => ({
    ...r,
    connection_types: safeJson(r.connection_types) ?? [],
    knn: safeJson(r.knn) ?? [],
    image_url: r.image_key ? `/api/images/${r.image_key}` : null,
    image_key: undefined,
  }));
  return c.json({ items });
});

/**
 * GET /api/stories/:id
 * Full approved story. Audio URL is omitted unless voice_visibility='public'.
 */
app.get("/api/stories/:id", async (c) => {
  const id = c.req.param("id");
  const row = await c.env.DB.prepare(
    `SELECT id, kind, created_at, lat, lng, location_label, text, text_long, source,
            audio_key, audio_mime, voice_visibility, image_key, image_mime,
            age_band, gender, connection_types, connection_subject,
            environment, altered_state, altered_state_detail,
            pheno, body, status, lang
     FROM stories WHERE id = ? AND status = 'approved'`
  ).bind(id).first<any>();
  if (!row) return c.json({ error: "not found" }, 404);

  // audio_key already starts with "audio/" so the URL becomes /api/audio/audio/<filename>
  const audio_url =
    row.source === "voice" && row.voice_visibility === "public" && row.audio_key
      ? `/api/audio/${row.audio_key}`
      : null;
  const image_url = row.image_key ? `/api/images/${row.image_key}` : null;

  return c.json({
    ...row,
    connection_types: safeJson(row.connection_types) ?? [],
    environment:      safeJson(row.environment)      ?? [],
    pheno: safeJson(row.pheno) ?? {},
    body:  safeJson(row.body)  ?? [],
    audio_key: undefined,                     // never leak raw R2 keys
    image_key: undefined,
    audio_url,
    image_url,
  });
});

/**
 * POST /api/stories
 * Create a story (status='pending'). Rate-limited by IP. Requires consent.
 */
app.post("/api/stories", async (c) => {
  const ip = clientIp(c.req.raw);
  const { success } = await c.env.RL_STORIES.limit({ key: ip });
  if (!success) return c.json({ error: "rate limited — try again in a minute" }, 429);

  const body = await c.req.json().catch(() => null);
  const v = validate(body);
  if (!v.ok) return c.json({ error: v.error }, 400);
  const d = v.data;

  // Hash the IP so we have a dedup/rate signal without storing the raw value.
  const ipHash = await sha256Hex(`${ip}|${c.env.CONSENT_VERSION}`);
  const id = d.id ?? uid();
  const now = Date.now();

  await c.env.DB.prepare(
    `INSERT INTO stories
       (id, kind, created_at, lat, lng, location_label, text, text_long, source,
        audio_key, audio_mime, voice_visibility, image_key, image_mime,
        age_band, gender, connection_types, connection_subject,
        environment, altered_state, altered_state_detail,
        pheno, body, status, consent_version, lang, submitter_ip_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
  ).bind(
    id, d.kind, now, d.lat, d.lng, d.location_label, d.text, d.text_long, d.source,
    d.audio_key, d.audio_mime, d.voice_visibility,
    d.image_key, d.image_mime,
    d.age_band ?? null, d.gender ?? null,
    JSON.stringify(d.connection_types ?? []), d.connection_subject ?? null,
    JSON.stringify(d.environment ?? []), d.altered_state ?? null, d.altered_state_detail ?? null,
    JSON.stringify(d.pheno ?? {}),
    JSON.stringify(d.body ?? []),
    d.consent_version, d.lang, ipHash,
  ).run();

  // Fire-and-forget: embed the text and upsert to Vectorize. We don't await so
  // the API stays fast; the vector arrives a few hundred ms later.
  c.executionCtx.waitUntil(upsertStoryVector(c.env, {
    id, text: d.text, kind: d.kind, status: "pending",
    lat: d.lat, lng: d.lng, lang: d.lang ?? null,
  }));

  return c.json({ id, status: "pending" }, 201);
});

/**
 * POST /api/admin/reintegrate/:id
 * Debug-only: re-runs the per-submit integration pipeline (project + cluster +
 * KNN) against an existing story's stored embedding. Lets us verify the
 * realtime path works locally without needing a fresh AI embedding.
 */
app.post("/api/admin/reintegrate/:id", async (c) => {
  const id = c.req.param("id");
  const row = await c.env.DB.prepare(
    `SELECT id, kind, text_embedding FROM stories WHERE id = ?`
  ).bind(id).first<any>();
  if (!row) return c.json({ error: "not found" }, 404);
  if (!row.text_embedding) return c.json({ error: "no embedding" }, 400);
  let vec: number[];
  try { vec = JSON.parse(row.text_embedding); } catch { return c.json({ error: "bad embedding" }, 500); }
  await integrateNewStory(c.env, row.id, row.kind, vec);
  const after = await c.env.DB.prepare(
    `SELECT proj_x, proj_y, proj_z, cluster_id, cluster_id_kind, knn FROM stories WHERE id = ?`
  ).bind(id).first<any>();
  return c.json({
    id: row.id,
    kind: row.kind,
    proj: [after.proj_x, after.proj_y, after.proj_z],
    cluster_id: after.cluster_id,
    cluster_id_kind: after.cluster_id_kind,
    knn: safeJson(after.knn),
  });
});

/**
 * POST /api/admin/recompute-projection
 * Rebuilds proj_x / proj_y for every approved story that has a text_embedding.
 * Power-iteration PCA, normalized into a safe slice of MapLibre coords.
 */
app.post("/api/admin/recompute-projection", async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT id, text_embedding FROM stories
     WHERE status = 'approved' AND text_embedding IS NOT NULL`
  ).all<any>();
  const items = rows.results ?? [];
  if (items.length < 2) return c.json({ scanned: items.length, ok: 0, error: "need ≥2 embedded rows" });

  const ids: string[] = [];
  const vecs: number[][] = [];
  for (const r of items) {
    try {
      const v = JSON.parse(r.text_embedding);
      if (Array.isArray(v) && v.length > 0) { ids.push(r.id); vecs.push(v); }
    } catch (_) {}
  }

  // Pull kind + text for each id — needed for per-kind k-means + LLM labeling.
  const meta = await c.env.DB.prepare(
    `SELECT id, kind, text FROM stories WHERE status = 'approved' AND text_embedding IS NOT NULL`
  ).all<any>();
  const byIdMeta = new Map((meta.results ?? []).map((r: any) => [r.id, r]));

  const { proj, varRatio, mean, components } = pcaTopK(vecs, 3);
  const norm = normalizeProjection(proj);
  const knnPerRow = allPairsKnn(vecs, ids, 3);

  // Capture the [min, max] of each raw PCA axis BEFORE normalization so a
  // newly-submitted story can be projected into the same coordinate frame.
  const projRanges = [0, 1, 2].map((dim) => {
    let lo = Infinity, hi = -Infinity;
    for (const p of proj) {
      if (p[dim] < lo) lo = p[dim];
      if (p[dim] > hi) hi = p[dim];
    }
    return [lo, hi];
  });

  // 1) Global cluster.
  const kAll = Math.min(8, Math.max(2, Math.floor(ids.length / 8)));
  const clustersAll = kMeans(vecs, kAll, 30);
  const centroidsAll = computeCentroids(vecs, clustersAll, kAll);

  // 2) Within-kind clusters.
  const kindClusterPerId = new Map<string, number>();             // id → cluster_id_kind
  const kindGroups: { scope: string; ids: string[]; vecs: number[][]; assign: number[]; k: number; centroids: number[][] }[] = [];
  const kindsSeen: string[] = [];
  for (const kind of ["personal", "myth", "pareidolia"]) {
    const localIdx = ids
      .map((id, i) => ({ id, i, kind: byIdMeta.get(id)?.kind }))
      .filter((r) => r.kind === kind);
    if (localIdx.length < 4) continue;
    const localVecs = localIdx.map((r) => vecs[r.i]);
    const localIds  = localIdx.map((r) => r.id);
    const kKind = Math.min(8, Math.max(2, Math.round(Math.sqrt(localIdx.length))));
    const localAssign = kMeans(localVecs, kKind, 30);
    const localCentroids = computeCentroids(localVecs, localAssign, kKind);
    localIdx.forEach((r, j) => kindClusterPerId.set(r.id, localAssign[j]));
    kindGroups.push({ scope: kind, ids: localIds, vecs: localVecs, assign: localAssign, k: kKind, centroids: localCentroids });
    kindsSeen.push(kind);
  }

  // 3) Pick representative texts per cluster (centroid-nearest), then ask
  //    Workers AI Llama for a 2-4 word theme name. Manual overrides win.
  const PICK = 6;
  const existingLabels = await c.env.DB.prepare(
    `SELECT scope, id, manual FROM clusters`
  ).all<any>();
  const manualMap = new Map<string, string | null>();
  for (const r of existingLabels.results ?? []) {
    manualMap.set(`${r.scope}|${r.id}`, r.manual ?? null);
  }

  type ClusterRow = { scope: string; id: number; label: string | null; size: number; status: "named" | "manual" | "failed" };
  const clusterRows: ClusterRow[] = [];

  async function labelGroup(scope: string, groupVecs: number[][], groupIds: string[], groupAssign: number[], k: number) {
    const reps = nearestToCentroid(groupVecs, groupAssign, k, PICK);
    for (let cid = 0; cid < k; cid++) {
      const size = groupAssign.filter((a) => a === cid).length;
      const manualKey = `${scope}|${cid}`;
      if (manualMap.get(manualKey)) {
        // Manual override exists — don't overwrite it.
        clusterRows.push({ scope, id: cid, label: null, size, status: "manual" });
        continue;
      }
      const repIds = reps[cid] || [];
      const texts = repIds.map((j) => byIdMeta.get(groupIds[j])?.text).filter(Boolean) as string[];
      const label = await nameCluster(c.env, texts, scope === "all" ? null : scope);
      clusterRows.push({ scope, id: cid, label, size, status: label ? "named" : "failed" });
    }
  }

  await labelGroup("all", vecs, ids, clustersAll, kAll);
  for (const g of kindGroups) {
    await labelGroup(g.scope, g.vecs, g.ids, g.assign, g.k);
  }

  // 4) Persist cluster labels (label is only updated when no manual override exists).
  const now = Date.now();
  const labelBatch: D1PreparedStatement[] = [];
  const upsertWithLabel = c.env.DB.prepare(
    `INSERT INTO clusters (scope, id, label, size, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(scope, id) DO UPDATE SET label = excluded.label, size = excluded.size, updated_at = excluded.updated_at
     WHERE clusters.manual IS NULL OR clusters.manual = ''`
  );
  const upsertSizeOnly = c.env.DB.prepare(
    `INSERT INTO clusters (scope, id, size, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(scope, id) DO UPDATE SET size = excluded.size, updated_at = excluded.updated_at`
  );
  for (const r of clusterRows) {
    if (r.label) labelBatch.push(upsertWithLabel.bind(r.scope, r.id, r.label, r.size, now));
    else         labelBatch.push(upsertSizeOnly.bind(r.scope, r.id, r.size, now));
  }
  if (labelBatch.length > 0) await c.env.DB.batch(labelBatch);

  // 5) Persist projection_meta so a fresh submission can be projected + clustered
  //    in real time without redoing PCA / k-means.
  await saveProjectionMeta(c.env, "pca", {
    mean, components, ranges: projRanges,
  });
  await saveProjectionMeta(c.env, "kmeans_all", { centroids: centroidsAll });
  for (const g of kindGroups) {
    await saveProjectionMeta(c.env, `kmeans_${g.scope}`, { centroids: g.centroids });
  }

  // 6) Persist per-story projection + KNN + global cluster + within-kind cluster.
  const stmt = c.env.DB.prepare(
    `UPDATE stories SET proj_x = ?, proj_y = ?, proj_z = ?, knn = ?, cluster_id = ?, cluster_id_kind = ? WHERE id = ?`
  );
  const batch = ids.map((id, i) => stmt.bind(
    norm[i][0], norm[i][1], norm[i][2],
    JSON.stringify(knnPerRow[i]), clustersAll[i],
    kindClusterPerId.has(id) ? kindClusterPerId.get(id) : null,
    id
  ));
  await c.env.DB.batch(batch);

  return c.json({
    scanned: ids.length,
    ok: ids.length,
    variance_ratio: varRatio,
    knn_k: 3,
    clusters: {
      all: kAll,
      by_kind: Object.fromEntries(kindGroups.map((g) => [g.scope, g.k])),
    },
    labels: {
      named:   clusterRows.filter((r) => r.status === "named").length,
      manual:  clusterRows.filter((r) => r.status === "manual").length,
      failed:  clusterRows.filter((r) => r.status === "failed").length,
    },
  });
});

/**
 * POST /api/admin/embed-backfill?limit=200
 * Walks approved stories and upserts their text embeddings to Vectorize.
 * Idempotent — safe to re-run. No auth in v1 (plan step 4 will gate it).
 */
app.post("/api/admin/embed-backfill", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") ?? 50), 200);
  const rows = await c.env.DB.prepare(
    `SELECT id, text, kind, status, lat, lng, lang
     FROM stories WHERE status = 'approved' ORDER BY created_at DESC LIMIT ?`
  ).bind(limit).all<any>();

  const items = rows.results ?? [];
  let ok = 0, fail = 0;
  for (const s of items) {
    const success = await upsertStoryVector(c.env, s);
    success ? ok++ : fail++;
  }
  return c.json({ scanned: items.length, ok, fail });
});

/**
 * GET /api/stories/:id/resonant?limit=8&lens=text
 * Top-K most semantically similar approved stories. Excludes self and any
 * non-approved rows. The 'text' lens is the equal-footing default — every
 * story has a text, regardless of kind or whether the contributor filled
 * body / altered_state.
 */
app.get("/api/stories/:id/resonant", async (c) => {
  const id = c.req.param("id");
  const limit = Math.min(Number(c.req.query("limit") ?? 8), 20);

  // Pull the seed story's text + its cached embedding (if any). Re-embedding
  // when needed lets the same endpoint shape support "echo while you write."
  const self = await c.env.DB.prepare(
    `SELECT text, text_embedding FROM stories WHERE id = ? AND status = 'approved'`
  ).bind(id).first<any>();
  if (!self) return c.json({ items: [] });

  let vec: number[] | null = null;
  if (self.text_embedding) {
    try { vec = JSON.parse(self.text_embedding); } catch (_) {}
  }
  if (!vec) vec = await embedText(c.env, self.text);
  if (!vec) return c.json({ items: [], error: "embedding unavailable" });

  // 1) Try Vectorize first (the production path).
  let scored: { id: string; score: number }[] | null = null;
  if (c.env.VECTORIZE_TEXT) {
    try {
      const m = await c.env.VECTORIZE_TEXT.query(vec, {
        topK: limit + 4,
        returnMetadata: "indexed",
        filter: { status: "approved" },
      });
      scored = (m?.matches ?? [])
        .filter((x: any) => x.id !== id)
        .slice(0, limit)
        .map((x: any) => ({ id: x.id, score: x.score }));
    } catch (e) {
      console.warn("vectorize query failed; falling back to d1", e);
    }
  }

  // 2) Fallback: scan D1 stories that have a stored embedding, rank by cosine.
  //    Fast for sub-1K corpora; if the corpus grows past a few thousand and
  //    Vectorize still isn't available, swap in a SQL-level ANN approximation.
  if (!scored || scored.length === 0) {
    const rows = await c.env.DB.prepare(
      `SELECT id, text_embedding FROM stories
       WHERE status = 'approved' AND text_embedding IS NOT NULL AND id != ?`
    ).bind(id).all<any>();
    const candidates: { id: string; score: number }[] = [];
    for (const r of rows.results ?? []) {
      try {
        const emb = JSON.parse(r.text_embedding);
        candidates.push({ id: r.id, score: cosineSim(vec, emb) });
      } catch (_) {}
    }
    candidates.sort((a, b) => b.score - a.score);
    scored = candidates.slice(0, limit);
  }

  if (scored.length === 0) return c.json({ items: [] });

  // Hydrate each match with the pin payload, preserving rank.
  const placeholders = scored.map(() => "?").join(",");
  const rows = await c.env.DB.prepare(
    `SELECT id, kind, lat, lng, location_label, connection_subject,
            substr(text, 1, 140) AS snippet, source
     FROM stories WHERE id IN (${placeholders}) AND status = 'approved'`
  ).bind(...scored.map((x) => x.id)).all<any>();
  const byId = new Map((rows.results ?? []).map((r: any) => [r.id, r]));
  const items = scored
    .map(({ id: rid, score }) => byId.get(rid) ? { ...byId.get(rid), score } : null)
    .filter(Boolean);
  return c.json({ items });
});

/**
 * POST /api/images
 * Body: raw image bytes (jpeg/png/webp/gif). Returns { key, mime }.
 * Rate-limited per IP. Max 5MB. The returned key can then be sent as
 * image_key in the subsequent POST /api/stories payload.
 */
app.post("/api/images", async (c) => {
  const ip = clientIp(c.req.raw);
  const { success } = await c.env.RL_STORIES.limit({ key: ip });
  if (!success) return c.json({ error: "rate limited — try again in a minute" }, 429);

  const mime = (c.req.header("Content-Type") || "").split(";")[0].trim().toLowerCase();
  if (!IMAGE_MIMES.has(mime)) {
    return c.json({ error: "Content-Type must be image/jpeg, image/png, image/webp, or image/gif" }, 415);
  }
  const body = await c.req.arrayBuffer();
  if (body.byteLength === 0)            return c.json({ error: "empty body" }, 400);
  if (body.byteLength > MAX_IMAGE_BYTES) return c.json({ error: "image too large (max 5MB)" }, 413);

  const ext = mime === "image/jpeg" ? "jpg" : mime.split("/")[1];
  const key = `img/${uid()}.${ext}`;
  await c.env.MEDIA.put(key, body, { httpMetadata: { contentType: mime } });
  return c.json({ key, mime });
});

/**
 * GET /api/images/img/:filename
 * Streams an R2 object back with its content-type and a 1-day cache header.
 * The story endpoints only emit image URLs when the row's image_key exists,
 * so there's no separate gating here (cf. /api/audio which has voice_visibility).
 */
app.get("/api/images/img/:filename", async (c) => {
  const filename = c.req.param("filename");
  const key = `img/${filename}`;
  const obj = await c.env.MEDIA.get(key);
  if (!obj) return c.text("not found", 404);
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=86400",
    },
  });
});

/**
 * POST /api/transcribe
 * Body: raw audio bytes (webm/ogg/wav/mp4/mpeg/...). Returns
 *   { audio_key, audio_mime, transcript, lang }
 * The audio is stored in R2 under audio/<uuid>.<ext> and then run through
 * Workers AI Whisper. This endpoint does NOT create a story — the front-end
 * lets the user edit the transcript before they POST /api/stories with the
 * returned audio_key. Rate-limited per IP.
 */
app.post("/api/transcribe", async (c) => {
  const ip = clientIp(c.req.raw);
  const { success } = await c.env.RL_STORIES.limit({ key: ip });
  if (!success) return c.json({ error: "rate limited — try again in a minute" }, 429);

  const mime = (c.req.header("Content-Type") || "").split(";")[0].trim().toLowerCase();
  if (!AUDIO_MIMES.has(mime)) {
    return c.json({ error: "Content-Type must be an audio/* mime", got: mime }, 415);
  }
  const buf = await c.req.arrayBuffer();
  if (buf.byteLength === 0)            return c.json({ error: "empty body" }, 400);
  if (buf.byteLength > MAX_AUDIO_BYTES) return c.json({ error: "audio too large (max 20MB)" }, 413);

  const key = `audio/${uid()}.${audioExt(mime)}`;
  await c.env.MEDIA.put(key, buf, { httpMetadata: { contentType: mime } });

  // Whisper. If transcription fails we still return the audio_key so the user
  // can type the transcript themselves and submit anyway.
  let transcript = "";
  let lang: string | null = null;
  try {
    const audio = [...new Uint8Array(buf)];
    const result: any = await c.env.AI.run(
      "@cf/openai/whisper-large-v3-turbo",
      { audio },
    );
    transcript = String(result?.text ?? "").trim();
    lang = result?.transcription_info?.language ?? result?.language ?? null;
  } catch (e) {
    console.warn("whisper failed", e);
  }

  return c.json({ audio_key: key, audio_mime: mime, transcript, lang });
});

/**
 * GET /api/audio/audio/:filename
 * Streams the R2 audio object — but only if the story owning this audio_key
 * is status='approved' AND voice_visibility='public'. Otherwise 404.
 * Cache as private (per-user, short) so a story going from public → private
 * stops being served quickly.
 */
app.get("/api/audio/audio/:filename", async (c) => {
  const filename = c.req.param("filename");
  const key = `audio/${filename}`;

  const row = await c.env.DB.prepare(
    `SELECT status, voice_visibility FROM stories WHERE audio_key = ? LIMIT 1`
  ).bind(key).first<any>();
  if (!row || row.status !== "approved" || row.voice_visibility !== "public") {
    return c.text("not found", 404);
  }

  const obj = await c.env.MEDIA.get(key);
  if (!obj) return c.text("not found", 404);
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
});

/* --- placeholder route for plan step 4 — not implemented yet --- */
app.patch("/api/admin/stories/:id", (c) => c.json({ error: "not implemented yet (plan step 4)" }, 501));

/* ============================================================================ */

function safeJson(s: unknown) {
  if (typeof s !== "string") return s;
  try { return JSON.parse(s); } catch { return null; }
}

/* ============================================================================
 * Plan step 6 — text embeddings via bge-m3 → Vectorize.
 * One vector per story (text-only, language-agnostic). Body / altered_state
 * facets stay separate by design (see project memory) — they're not fused.
 * ========================================================================== */

const EMBED_MODEL = "@cf/baai/bge-m3";

async function embedText(env: Env, text: string): Promise<number[] | null> {
  if (!text || !text.trim()) return null;
  try {
    const result: any = await env.AI.run(EMBED_MODEL, { text: [text.slice(0, 8000)] });
    // bge-m3 returns { shape: [1, 1024], data: [[...1024 floats...]] }
    const vec = result?.data?.[0];
    if (Array.isArray(vec) && vec.length > 0) return vec.map((x: number) => Number(x));
    return null;
  } catch (e) {
    console.warn("embed failed", e);
    return null;
  }
}

async function upsertStoryVector(env: Env, story: {
  id: string; text: string; kind: string; status: string;
  lat: number; lng: number; lang?: string | null;
}): Promise<boolean> {
  const vec = await embedText(env, story.text);
  if (!vec) return false;

  // 1) Persist the raw embedding in D1. Always — cheap and survives Vectorize wipes.
  try {
    await env.DB.prepare(
      `UPDATE stories SET text_embedding = ? WHERE id = ?`
    ).bind(JSON.stringify(vec), story.id).run();
  } catch (e) {
    console.warn("d1 embedding write failed", e);
  }

  // 2) Real-time integration: project onto stored PCA axes, assign to nearest
  //    k-means centroid (global + within-kind), and compute top-3 KNN against
  //    existing approved stories. If meta isn't available yet (first run,
  //    pre-recompute), silently skip — the story still shows up as a pin,
  //    just not in constellation / clusters until the next recompute.
  try {
    await integrateNewStory(env, story.id, story.kind, vec);
  } catch (e) {
    console.warn("realtime integration failed", e);
  }

  // 3) Best-effort Vectorize upsert.
  if (env.VECTORIZE_TEXT) {
    try {
      await env.VECTORIZE_TEXT.upsert([{
        id: story.id,
        values: vec,
        metadata: {
          kind: story.kind,
          status: story.status,
          lat: story.lat, lng: story.lng,
          lang: story.lang || "",
        },
      }]);
    } catch (e) {
      console.warn("vectorize upsert failed", e);
    }
  }
  return true;
}

/** Project + cluster + KNN a single new story using the stored model meta.
 *  Called from upsertStoryVector after the embedding is written.            */
async function integrateNewStory(env: Env, id: string, kind: string, vec: number[]) {
  // Load model artifacts written by the last recompute.
  const [pca, kmeansAll, kmeansKind] = await Promise.all([
    loadProjectionMeta(env, "pca"),
    loadProjectionMeta(env, "kmeans_all"),
    loadProjectionMeta(env, `kmeans_${kind}`),
  ]);
  if (!pca) return;                                            // no model yet — recompute hasn't run

  const projected = applyProjection(pca, vec);                  // [proj_x, proj_y, proj_z] or null
  const clusterAll = kmeansAll?.centroids
    ? nearestCentroid(kmeansAll.centroids, vec) : null;
  const clusterKind = kmeansKind?.centroids
    ? nearestCentroid(kmeansKind.centroids, vec) : null;

  // KNN: scan D1 for top-3 cosine neighbours among other approved+embedded rows.
  const others = await env.DB.prepare(
    `SELECT id, text_embedding FROM stories
     WHERE status = 'approved' AND text_embedding IS NOT NULL AND id != ?`
  ).bind(id).all<any>();
  const knn: { id: string; score: number }[] = [];
  for (const r of others.results ?? []) {
    try {
      const ov = JSON.parse(r.text_embedding);
      knn.push({ id: r.id, score: cosineSim(vec, ov) });
    } catch (_) {}
  }
  knn.sort((a, b) => b.score - a.score);
  const topKnn = knn.slice(0, 3);

  await env.DB.prepare(
    `UPDATE stories
     SET proj_x = ?, proj_y = ?, proj_z = ?,
         cluster_id = ?, cluster_id_kind = ?,
         knn = ?
     WHERE id = ?`
  ).bind(
    projected?.[0] ?? null, projected?.[1] ?? null, projected?.[2] ?? null,
    clusterAll, clusterKind,
    JSON.stringify(topKnn),
    id,
  ).run();
}

/* ============================================================================
 * Phase B — 2D projection of embeddings for the constellation view.
 *
 * Power-iteration PCA. We center the embeddings, deflate each found component,
 * and recover the top-K (here K=2). Tractable for our scale: 118 stories ×
 * 1024 dims, two components, ~50 iterations each is single-digit milliseconds.
 *
 * Output is projected coordinates normalized to a safe slice of Web Mercator
 * (−150..150 lng × −60..60 lat) so MapLibre renders them comfortably under
 * the same camera as the geographic view.
 * ========================================================================== */

/** Top-K principal components via power iteration with deflation. K-dim projections. */
function pcaTopK(
  vectors: number[][], k: number
): { proj: number[][]; varRatio: number[]; mean: number[]; components: number[][] } {
  const n = vectors.length;
  if (n < 2) return {
    proj: vectors.map(() => new Array(k).fill(0)),
    varRatio: new Array(k).fill(0),
    mean: vectors[0] ? new Array(vectors[0].length).fill(0) : [],
    components: [],
  };
  const d = vectors[0].length;

  const mean = new Array(d).fill(0);
  for (const v of vectors) for (let i = 0; i < d; i++) mean[i] += v[i];
  for (let i = 0; i < d; i++) mean[i] /= n;
  const X = vectors.map((v) => v.map((x, i) => x - mean[i]));

  let totalVar = 0;
  for (const v of X) for (let i = 0; i < d; i++) totalVar += v[i] * v[i];
  totalVar /= n;

  function powerIter(seed: number, Xref: number[][]): number[] {
    let u = new Array(d);
    let s = seed;
    for (let i = 0; i < d; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; u[i] = (s / 0x7fffffff) - 0.5; }
    normalize(u);
    for (let iter = 0; iter < 60; iter++) {
      const Xu = Xref.map((row) => dot(row, u));
      const next = new Array(d).fill(0);
      for (let j = 0; j < n; j++) {
        const xj = Xref[j], xju = Xu[j];
        for (let i = 0; i < d; i++) next[i] += xj[i] * xju;
      }
      normalize(next);
      let same = 0; for (let i = 0; i < d; i++) same += next[i] * u[i];
      u = next;
      if (Math.abs(Math.abs(same) - 1) < 1e-7) break;
    }
    return u;
  }

  const components: number[][] = [];
  let work = X.map((r) => r.slice());
  for (let c = 0; c < k; c++) {
    const pc = powerIter(c * 7 + 1, work);
    components.push(pc);
    // Deflate.
    work = work.map((row) => {
      const c2 = dot(row, pc);
      return row.map((x, i) => x - c2 * pc[i]);
    });
  }

  // Project ORIGINAL centered data onto each component.
  const centered = vectors.map((v) => v.map((x, i) => x - mean[i]));
  const proj = centered.map((row) => components.map((pc) => dot(row, pc)));

  const varRatio: number[] = [];
  for (let c = 0; c < k; c++) {
    let s = 0;
    for (const p of proj) s += p[c] * p[c];
    s /= n;
    varRatio.push(totalVar > 0 ? s / totalVar : 0);
  }
  return { proj, varRatio, mean, components };
}

function dot(a: number[], b: number[]): number {
  let s = 0; const n = a.length;
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}
function normalize(a: number[]): void {
  let s = 0; const n = a.length;
  for (let i = 0; i < n; i++) s += a[i] * a[i];
  s = Math.sqrt(s) || 1;
  for (let i = 0; i < n; i++) a[i] /= s;
}

/** Normalize PCA coords: PC1→lng [-150,150], PC2→lat [-60,60], PC3→[-1,1] for size. */
function normalizeProjection(proj: number[][]): number[][] {
  if (proj.length === 0) return proj;
  const dims = proj[0].length;
  const mins = new Array(dims).fill(Infinity);
  const maxs = new Array(dims).fill(-Infinity);
  for (const p of proj) for (let i = 0; i < dims; i++) {
    if (p[i] < mins[i]) mins[i] = p[i];
    if (p[i] > maxs[i]) maxs[i] = p[i];
  }
  const ranges = mins.map((m, i) => (maxs[i] - m) || 1);
  // PC1 → [-150, 150], PC2 → [-60, 60], PC3 → [-1, 1]
  const targets: [number, number][] = [[-150, 150], [-60, 60], [-1, 1]];
  return proj.map((p) =>
    p.map((v, i) => {
      const [lo, hi] = targets[i] ?? [-1, 1];
      return ((v - mins[i]) / ranges[i]) * (hi - lo) + lo;
    })
  );
}

/** K-means clustering. Cosine-flavoured: assignments use cosine similarity
 *  (vectors are length-normalized), centroids are renormalized after each step. */
function kMeans(vectors: number[][], k: number, iters = 20): number[] {
  const n = vectors.length;
  if (n === 0) return [];
  const d = vectors[0].length;
  // L2-normalize copies — leaves the input alone.
  const X = vectors.map((v) => {
    const norm = Math.sqrt(dot(v, v)) || 1;
    return v.map((x) => x / norm);
  });

  // k-means++ seeding: pick the first centroid at random, then weight each
  // subsequent pick by (1 - cosine(x, nearest centroid)).
  const centroids: number[][] = [];
  let seed = 13;
  const rng = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  centroids.push(X[Math.floor(rng() * n)].slice());
  while (centroids.length < k) {
    const dists = X.map((x) => {
      let best = -Infinity;
      for (const c of centroids) {
        const s = dot(x, c);
        if (s > best) best = s;
      }
      // higher cos = closer; convert to a positive "distance" weight.
      return Math.max(0, 1 - best);
    });
    const sum = dists.reduce((a, b) => a + b, 0) || 1;
    let r = rng() * sum;
    let i = 0;
    for (; i < n - 1; i++) { r -= dists[i]; if (r <= 0) break; }
    centroids.push(X[i].slice());
  }

  let assign = new Array(n).fill(0);
  for (let it = 0; it < iters; it++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      let best = -Infinity, bestK = 0;
      for (let c = 0; c < k; c++) {
        const s = dot(X[i], centroids[c]);
        if (s > best) { best = s; bestK = c; }
      }
      if (assign[i] !== bestK) { changed = true; assign[i] = bestK; }
    }
    if (!changed) break;
    // Recompute centroids: mean of assigned points, then renormalize.
    const sums = Array.from({ length: k }, () => new Array(d).fill(0));
    const counts = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      const a = assign[i]; counts[a]++;
      const v = X[i];
      const sa = sums[a];
      for (let j = 0; j < d; j++) sa[j] += v[j];
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] === 0) {
        // Empty cluster: re-seed with the point farthest from any centroid.
        let worst = -Infinity, worstI = 0;
        for (let i = 0; i < n; i++) {
          let best = -Infinity;
          for (const cc of centroids) {
            const s = dot(X[i], cc);
            if (s > best) best = s;
          }
          const distLike = 1 - best;
          if (distLike > worst) { worst = distLike; worstI = i; }
        }
        centroids[c] = X[worstI].slice();
        continue;
      }
      const s = sums[c];
      for (let j = 0; j < d; j++) s[j] /= counts[c];
      const norm = Math.sqrt(dot(s, s)) || 1;
      for (let j = 0; j < d; j++) s[j] /= norm;
      centroids[c] = s;
    }
  }
  return assign;
}

/** L2-normalized centroids for each cluster — needed both to assign new points later
 *  and to label clusters via their centroid-nearest representatives. */
function computeCentroids(vectors: number[][], assign: number[], k: number): number[][] {
  if (vectors.length === 0) return [];
  const d = vectors[0].length;
  const sums = Array.from({ length: k }, () => new Array(d).fill(0));
  const counts = new Array(k).fill(0);
  for (let i = 0; i < vectors.length; i++) {
    const a = assign[i];
    counts[a]++;
    const v = vectors[i];
    for (let j = 0; j < d; j++) sums[a][j] += v[j];
  }
  return sums.map((s, c) => {
    if (counts[c] === 0) return new Array(d).fill(0);
    const m = s.map((x) => x / counts[c]);
    const norm = Math.sqrt(dot(m, m)) || 1;
    return m.map((x) => x / norm);
  });
}

/** All-pairs cosine similarity → top-K neighbours per row. Returns array aligned with ids. */
function allPairsKnn(
  vectors: number[][], ids: string[], k: number
): { id: string; score: number }[][] {
  const n = vectors.length;
  const norms = vectors.map((v) => Math.sqrt(dot(v, v)) || 1);
  const out: { id: string; score: number }[][] = [];
  for (let i = 0; i < n; i++) {
    const sims: { id: string; score: number }[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const s = dot(vectors[i], vectors[j]) / (norms[i] * norms[j]);
      sims.push({ id: ids[j], score: s });
    }
    sims.sort((a, b) => b.score - a.score);
    out.push(sims.slice(0, k));
  }
  return out;
}

/* ============================================================================
 * Realtime projection helpers — model artifacts persisted after each recompute
 * so a new submission can be projected + clustered without redoing PCA/k-means.
 * ========================================================================== */

const META_SCOPES = ["pca", "kmeans_all", "kmeans_personal", "kmeans_myth", "kmeans_pareidolia"] as const;

async function saveProjectionMeta(env: Env, scope: string, data: any) {
  const json = JSON.stringify(data);
  await env.DB.prepare(
    `INSERT INTO projection_meta (scope, data, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(scope) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
  ).bind(scope, json, Date.now()).run();
}

async function loadProjectionMeta(env: Env, scope: string): Promise<any | null> {
  const row = await env.DB.prepare(
    `SELECT data FROM projection_meta WHERE scope = ? LIMIT 1`
  ).bind(scope).first<any>();
  if (!row?.data) return null;
  try { return JSON.parse(row.data); } catch { return null; }
}

/** Project a single vector onto stored PCA axes and normalize using stored ranges. */
function applyProjection(meta: any, vec: number[]): [number, number, number] | null {
  if (!meta?.mean || !meta?.components || !meta?.ranges) return null;
  const { mean, components, ranges } = meta;
  if (vec.length !== mean.length) return null;
  const centered = vec.map((x, i) => x - mean[i]);
  const targets: [number, number][] = [[-150, 150], [-60, 60], [-1, 1]];
  const out: number[] = [];
  for (let k = 0; k < 3 && k < components.length; k++) {
    const raw = dot(centered, components[k]);
    const r = ranges[k] || [-1, 1];
    const [lo, hi] = targets[k] || [-1, 1];
    const span = (r[1] - r[0]) || 1;
    out.push(((raw - r[0]) / span) * (hi - lo) + lo);
  }
  return [out[0] ?? 0, out[1] ?? 0, out[2] ?? 0];
}

/** Assign a vector to the nearest centroid by cosine. Both inputs L2-normalized. */
function nearestCentroid(centroids: number[][], vec: number[]): number | null {
  if (!centroids || centroids.length === 0) return null;
  const vNorm = Math.sqrt(dot(vec, vec)) || 1;
  const vn = vec.map((x) => x / vNorm);
  let bestI = 0, bestSim = -Infinity;
  for (let i = 0; i < centroids.length; i++) {
    const s = dot(vn, centroids[i]);                          // centroids stored normalized
    if (s > bestSim) { bestSim = s; bestI = i; }
  }
  return bestI;
}

/** For each cluster, return the indices of the K rows nearest the centroid.
 *  Used to pick representative texts for LLM labeling. */
function nearestToCentroid(
  vectors: number[][], assign: number[], k: number, pickPerCluster: number
): number[][] {
  // Compute centroids (mean of L2-normalized vectors), then rank by cosine sim.
  const n = vectors.length;
  if (n === 0) return [];
  const d = vectors[0].length;
  const sums = Array.from({ length: k }, () => new Array(d).fill(0));
  const counts = new Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    const a = assign[i];
    counts[a]++;
    const v = vectors[i];
    const sa = sums[a];
    for (let j = 0; j < d; j++) sa[j] += v[j];
  }
  const centroids = sums.map((s, c) => {
    if (counts[c] === 0) return new Array(d).fill(0);
    return s.map((x) => x / counts[c]);
  });
  const out: number[][] = [];
  for (let c = 0; c < k; c++) {
    const sims: { i: number; s: number }[] = [];
    for (let i = 0; i < n; i++) if (assign[i] === c) {
      sims.push({ i, s: cosineSim(vectors[i], centroids[c]) });
    }
    sims.sort((a, b) => b.s - a.s);
    out.push(sims.slice(0, pickPerCluster).map((x) => x.i));
  }
  return out;
}

/** Ask Workers AI to name a cluster from its representative texts.
 *  The prompt is explicit about fidelity and bans cultural shortcuts. */
async function nameCluster(env: Env, texts: string[], kindContext: string | null): Promise<string | null> {
  if (texts.length === 0) return null;
  const numbered = texts.map((t, i) => `${i + 1}. ${t.trim()}`).join("\n");
  const audience = kindContext
    ? `short ${kindContext}-kind nature-connection texts`
    : `short nature-connection texts (a mix of personal stories, myths, and accounts of seeing figures in natural patterns)`;
  const system =
    `You name semantic clusters of human-written texts. Your only job is to produce a faithful theme name for the group below, in 2 to 4 words.

Hard rules:
- Stick to the literal shared substance: shared image, shared register, shared felt sense, shared narrative structure.
- Do NOT mention any specific culture, people, tradition, religion, language, region, or geography (no "Greek", "Polynesian", "Norse", "Slavic", "Indigenous", "African", "Western", "Eastern", etc.).
- Do NOT use generic umbrella words like "Mythology", "Folklore", "Stories", "Nature", "Spirituality", "Beliefs".
- Do NOT label them by canonical Western literary categories (e.g., "creation myths", "flood myths") unless that is literally what every text describes.
- Prefer concrete imagery or a felt-sense phrase to abstract academic language.
- 2 to 4 words. No quotes, no period, no leading article.

Reply with only the theme name. Nothing else.`;
  const user =
    `Here are ${texts.length} ${audience} that an embedding model grouped together because they share a deep theme:\n\n${numbered}\n\nTheme name:`;

  try {
    // Was `@cf/meta/llama-3.1-8b-instruct`, deprecated by Cloudflare on
    // 2026-05-30 (error 5028) — one day after this prompt was written. The
    // FP8 build is the same model at lower precision, so the wording above,
    // which was tuned against 3.1-8b, keeps behaving the way it was tested.
    // If label quality disappoints, `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
    // is the obvious step up: it follows the negative constraints in the
    // system prompt more reliably, at more latency and cost per call.
    const result: any = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8", {
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 24,
      temperature: 0.3,
    });
    let raw: string = (result?.response ?? result?.result?.response ?? "").toString();
    raw = raw.trim()
      .replace(/^["'`]+|["'`.,]+$/g, "")
      .replace(/^(Theme name|Name|Theme)\s*[:\-]\s*/i, "")
      .replace(/\s+/g, " ")
      .slice(0, 48);
    if (!raw) return null;
    // Block obvious culture-shortcut leaks (defensive — the prompt asks but LLMs slip).
    const banned = /\b(greek|norse|slavic|celtic|hindu|buddh|christian|islamic|judaic|polynesian|maori|aztec|maya|inca|navajo|lakota|inuit|yoruba|akan|zulu|maasai|persian|arabian|chinese|japanese|korean|mongol|baltic|sami|romani|hawaiian|aboriginal|cherokee|anishinaabe|mapuche|filipino|hmong|amazonian|finnish|basque|armenian|georgian|ethiopian|malagasy|quechua|tibetan|thai|balinese|vietnamese|haudenosaunee|mythology|folklore|western|eastern|indigenous|colonial)\b/i;
    if (banned.test(raw)) return null;
    return raw;
  } catch (e) {
    console.warn("cluster naming failed", e);
    return null;
  }
}

/** Cosine similarity. Defined here so the D1 fallback can rank without Vectorize. */
function cosineSim(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const ai = a[i], bi = b[i];
    dot += ai * bi; na += ai * ai; nb += bi * bi;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export default app;
