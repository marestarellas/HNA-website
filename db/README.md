# `db/`

Cloudflare D1 schema and migrations for `attuningtonature.earth`.

## Read this first

The database is **already created**. It is named `attuning_to_nature` — with
**underscores** — and `wrangler.jsonc` already holds its `database_id`.

Do **not** run `wrangler d1 create`. There is a hyphenated `attuning-to-nature`
name in older notes that was never provisioned; creating it would give you a
second, empty database and a confusing afternoon.

## Layout

- `migrations/0001_init.sql` … `0013_projection_meta.sql` — came from the map
  prototype and are **already applied to the live remote database**. Never
  renumber, rename or edit these. Their filenames are how D1 knows what it has
  already run.
- `migrations/0014_experiment_questionnaire.sql` — questionnaire, stimuli and
  experiment tables. Written here, not yet applied remotely.
- New migrations: `NNNN_<short_description>.sql`, next number in sequence.

## Local setup

Local D1 is emulated by Miniflare in `.wrangler/state/`. It is a separate,
throwaway database — **nothing you do locally touches production**, and you do
not need Cloudflare account access for this step.

```bash
npm install
npm run db:migrate:local
```

That applies all 14 migrations and seeds ~115 stories (a personal-story set
plus a myth corpus), which is enough to develop the `/stories` atlas against.

To start over, delete `.wrangler/state/` and re-run the migrate command.

## Day-to-day

```bash
# after adding db/migrations/00NN_<name>.sql
npm run db:migrate:local

# query the local database
npm run db:console:local -- "select kind, count(*) from stories group by kind;"

# query production (needs Cloudflare account access)
npm run db:console:remote -- "select count(*) from stories;"
```

## Applying to production

```bash
npm run db:migrate:remote
```

The remote database already has `0001`–`0013` recorded, so this will only run
`0014` and anything newer.

## The `/stories` atlas needs two extra passes

Migrations give you rows, but the semantic layer — embeddings, the 3D
projection, clusters, and nearest-neighbour links — is computed at runtime, not
baked into the seed data. A freshly migrated database will show all the pins in
World view, but Constellation view and the cluster list will be empty until you
run, with the dev server up:

```bash
curl -X POST "http://localhost:3000/api/admin/embed-backfill?limit=200"
curl -X POST "http://localhost:3000/api/admin/recompute-projection"
```

The first embeds every approved story; the second runs PCA, k-means (globally
and within each kind), k-nearest-neighbours, and names each cluster with an LLM.
Both need the `AI` binding, so they need Cloudflare account access — and they
bill real Workers AI usage even in local dev.

## Schema notes

- **`stories` is owned by the prototype's schema** (`0001_init.sql`), not by the
  bootstrap sketch that used to live here. Timestamps on that table are **epoch
  milliseconds (INTEGER)**, and `status` runs `pending | approved | rejected`.
  Only `approved` rows are served publicly.
- **`kind` is `personal | myth | pareidolia`** — three kinds, not the
  `personal | folklore` pair in older drafts. See CLAUDE.md §7.
- **Connection categories are JSON** on the story row (`connection_types`,
  `connection_subject`), not a join table.
- **The questionnaire and experiment tables use ISO-8601 UTC strings** for
  timestamps, and are long-format — one row per (instrument, item_key, value),
  so changing an instrument needs no migration.
- **IDs are TEXT** everywhere. Don't introduce `INTEGER PRIMARY KEY
  AUTOINCREMENT` — it leaks row counts.
