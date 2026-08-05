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
npm run dev
# → http://localhost:3000
```

That's it for the website itself. D1 and R2 bindings work locally only after the one-time Cloudflare setup below — until then, anything that reads from D1 or R2 will fail (the rest of the app is fine).

```bash
# Remotion studio (compose / preview animations)
npm run remotion:studio

# Render a composition to MP4
npm run remotion:render -- HelloWorld out/HelloWorld.mp4
```

## One-time Cloudflare setup (you, not the agent)

The agent did **not** create your Cloudflare account, the Workers project, the D1 database, or the R2 buckets. Those need your login. Do this once:

```bash
# 1. Authenticate Wrangler with your Cloudflare account
npx wrangler login

# 2. Create the D1 database. Copy the returned `database_id` into wrangler.jsonc
#    (replace REPLACE_WITH_D1_DATABASE_ID).
npx wrangler d1 create attuning-to-nature

# 3. Create the four R2 buckets referenced by wrangler.jsonc
npx wrangler r2 bucket create attuning-to-nature-opennext-cache
npx wrangler r2 bucket create attuning-to-nature-audio
npx wrangler r2 bucket create attuning-to-nature-stimuli
npx wrangler r2 bucket create attuning-to-nature-renders

# 4. Apply the initial schema — local first, then remote
npm run db:migrate:local
npm run db:migrate:remote

# 5. Generate typed bindings (Cloudflare env types for TypeScript)
npm run cf-typegen
```

Then, to deploy:

```bash
npm run deploy
```

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
| `npm run remotion:studio`    | Open the Remotion studio                               |
| `npm run remotion:render`    | Render a composition to a file                         |
| `npm run lint`               | ESLint                                                 |

## Where the agent goes next

Per [CLAUDE.md §6](CLAUDE.md#iteration-order):

1. ✅ **Bootstrap** — done.
2. ⏭ **Design system** — propose 2–3 distinct visual directions as static landing-page mocks, with a one-paragraph rationale each.
3. Section 2 (Educational) → Section 3 (Stories) → Section 4 (Experiment) → Section 1 (Science) → Landing.
