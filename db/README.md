# `db/`

Cloudflare D1 schema and migrations for `attuningtonature.earth`.

## Layout

- `migrations/0001_init.sql` — initial schema (stories, questionnaire, experiment).
- New migrations: name them `NNNN_<short_description>.sql` with the next sequence number.

## First-time setup

Run from the repo root.

```bash
# 1. Create the D1 database
npx wrangler d1 create attuning-to-nature
# → copy the returned `database_id` into wrangler.jsonc

# 2. Apply migrations locally (uses .wrangler/state/v3/d1, not the cloud DB)
npm run db:migrate:local

# 3. Apply migrations to the remote (production) D1
npm run db:migrate:remote
```

## Day-to-day

```bash
# Add a migration
# (just create db/migrations/0002_<name>.sql, then:)
npm run db:migrate:local
npm run db:migrate:remote

# Open a local SQL shell against the local DB
npx wrangler d1 execute attuning-to-nature --local --command "select * from stories limit 5;"

# Same against remote
npx wrangler d1 execute attuning-to-nature --remote --command "select count(*) from stories;"
```

## Schema notes

- **IDs are TEXT** (ULID/UUID, app-generated). Don't introduce `INTEGER PRIMARY KEY AUTOINCREMENT` — it leaks row counts and makes scaling harder.
- **Timestamps are ISO-8601 UTC strings.** Sort lexicographically; render in the user's locale at the edge.
- **Questionnaire and experiment responses are long-format** — every row is one (instrument, item_key, value) tuple. Adding or removing instrument items needs no migration.
- **Coordinates have a `location_precision_km` field** on `stories` — set >0 if the user opted into "approximate location" fuzzing for sensitive places.
- **`status = 'published'`** is the only state shown publicly. New rows default to `'pending'` so we can add moderation later without changing inserts.
