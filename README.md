# Attuning to Nature

The website at `attuningtonature.earth` — a scientific and artistic project on how humans attune to, and become coupled with, their environments.

The full project brief and operating manual is in [CLAUDE.md](CLAUDE.md). Read that before changing anything substantive. This README is the practical setup guide.

## Stack

- **Next.js 16** (App Router, TypeScript, src/ directory)
- **React 19**
- **Tailwind CSS 4** (CSS-first config in `src/app/globals.css`)
- **Remotion 4** for pre-rendered educational animations (`remotion/`)
- **Cloudflare Workers** via the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare) — D1 (SQLite at the edge) for data, R2 for media

## Local development

```bash
npm install
cp .env.example .env.local     # then paste in a MapTiler key — see below
npm run db:migrate:local       # creates the local DB and seeds ~115 stories
npm run dev
# → http://localhost:3000
```

`npm run db:migrate:local` builds a throwaway local database under
`.wrangler/state/` via Miniflare. It needs no Cloudflare account and never
touches production. See [db/README.md](db/README.md) for detail.

### Two things that will bite you

**You must be a member of the project's Cloudflare account, or `npm run dev`
will not start at all.** `wrangler.jsonc` declares `ai` and `vectorize`
bindings. Neither can be emulated locally, so OpenNext opens a remote proxy for
them at boot — and if that proxy fails to authenticate, it takes down
`getCloudflareContext()` for *every* route, not just the ones using AI. You get
500s across the whole site, which does not look like an auth problem.

So, once: `npx wrangler login`, and ask to be added to the Cloudflare account
that owns the `account_id` in `wrangler.jsonc`.

If you are not on the account yet and just want to work on the front end,
temporarily comment out the `ai` and `vectorize` blocks in `wrangler.jsonc`.
Everything except embedding, transcription and cluster naming works without
them — including all of D1, so the map and its 115 pins render fine. Don't
commit that change.

**The map needs a MapTiler key.** Without `NEXT_PUBLIC_MAPTILER_KEY` in
`.env.local`, `/stories` still loads every pin from D1 but the basemap 403s and
you get pins on a blank canvas. A free key from
[MapTiler](https://cloud.maptiler.com/account/keys/) is enough.

Note that the `AI` binding always calls the real Cloudflare API, so it bills
usage even in local dev.

```bash
# Remotion studio (compose / preview animations)
npm run remotion:studio

# Render a composition to MP4
npm run remotion:render -- HelloWorld out/HelloWorld.mp4
```

## Cloudflare resources

The D1 database **already exists** — `attuning_to_nature`, with underscores,
its `database_id` already in `wrangler.jsonc`. Do not run `wrangler d1 create`:
older notes mention a hyphenated `attuning-to-nature` that was never
provisioned, and creating it just gives you a second empty database.

Still to be provisioned by a human with account access, if they don't exist yet:

```bash
npx wrangler r2 bucket create attuning-to-nature-opennext-cache  # required by OpenNext
npx wrangler r2 bucket create attuning-to-nature-media           # story audio + images
npx wrangler r2 bucket create attuning-to-nature-stimuli         # Section 4 videos
npx wrangler r2 bucket create attuning-to-nature-renders         # Remotion output

# Optional — the resonance query falls back to a D1 cosine scan without it
npx wrangler vectorize create attuning-to-nature-text --dimensions=1024 --metric=cosine

npm run cf-typegen   # regenerate cloudflare-env.d.ts after any binding change
```

Then, to deploy:

```bash
npm run db:migrate:remote   # remote has 0001–0013 already; this runs 0014+
npm run deploy
```

After a deploy that adds stories, run the two admin passes described in
[db/README.md](db/README.md) so the atlas's clusters and constellation view
reflect the new rows.

The first `npm run deploy` registers the Worker `attuning-to-nature`. Bind the `attuningtonature.earth` zone to it from the Cloudflare dashboard (Workers & Pages → attuning-to-nature → Custom domains).

## Repository layout

See [CLAUDE.md §3](CLAUDE.md#3-repository-layout) for the canonical layout. Quick map:

| Path                | What it is                                                  |
| ------------------- | ----------------------------------------------------------- |
| `src/app/`          | Next.js App Router — pages, layouts, API route handlers     |
| `remotion/`         | Remotion compositions (educational animations)              |
| `db/migrations/`    | D1 schema migrations (applied via Wrangler)                 |
| `wrangler.jsonc`    | Cloudflare Worker config (bindings: D1, R2, ASSETS)         |
| `open-next.config.ts` | OpenNext Cloudflare adapter config                        |
| `CLAUDE.md`         | Full project brief + working agreement with the agent       |

## Key scripts

| Script                       | What it does                                           |
| ---------------------------- | ------------------------------------------------------ |
| `npm run dev`                | Next.js dev server (with D1/R2 bindings via OpenNext)  |
| `npm run build`              | Build the Next.js app                                  |
| `npm run preview`            | Build and preview the Worker locally                   |
| `npm run deploy`             | Build and deploy to Cloudflare Workers                 |
| `npm run cf-typegen`         | Regenerate `cloudflare-env.d.ts` from `wrangler.jsonc` |
| `npm run db:migrate:local`   | Apply DB migrations to the local Wrangler state        |
| `npm run db:migrate:remote`  | Apply DB migrations to remote D1                       |
| `npm run db:console:local`   | Run SQL against the local DB — pass the query after `--` |
| `npm run db:console:remote`  | Run SQL against production D1                          |
| `npm run remotion:studio`    | Open the Remotion studio                               |
| `npm run remotion:render`    | Render a composition to a file                         |
| `npm run lint`               | ESLint                                                 |

## Where the agent goes next

Per [CLAUDE.md §6](CLAUDE.md#iteration-order):

1. ✅ **Bootstrap** — done.
2. ⏭ **Design system** — 2–3 visual directions are sketched under `/design`; none chosen yet. Until one is, `/stories` keeps the palette and page chrome it was designed with, and `globals.css` tokens stay placeholders.
3. ✅ **Section 3 (Stories)** — the atlas is live at `/stories`: map, contribution flow, embeddings, semantic clusters. Merged from a standalone prototype; see CLAUDE.md §9.
4. Remaining: Section 2 (Educational) → Section 4 (Experiment) → Section 1 (Science) → Landing.
