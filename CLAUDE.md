# Attuning to Nature — Project Brief

> **For the Claude Code agent working on this repository.** This is your operating manual. Read it fully before writing code. Re-read the relevant section before starting each task.

---

## 0. Read these first, in this order

Before touching any code, internalize the project by reading:

1. **`/docs/grant-application.pdf`** (or `.md`) — the science behind the project. You should be able to explain in your own words: what human–environment coupling means here, what entrainment and complexity matching are, what the empirical study measures, and why this matters phenomenologically. Your design choices should be legible to someone who has read this grant.
2. **`/docs/design-references/`** — the visual / interaction touchstones we love. Study them. Note what makes them feel alive vs. dead. We will tell you which ones are closest in spirit; if that note isn't here yet, ask before assuming.
3. **`/docs/strategies/`** (or wherever existing repo notes live) — prior thinking on coupling strategies, complexity matching, and our scientific approach.
4. **This file.**

If any of these are missing or unclear, **stop and ask** rather than guess. The cost of misaligned exploration here is high.

---

## 1. Vision

The site is `attuningtonature.earth`. Entering it should feel like entering **the dream of nature** — not the postcard of nature.

We are a scientific and artistic project bringing together **neuroscience, phenomenology, computer science, and storytelling** around the question of how humans attune to, and become coupled with, their environments.

The site is simultaneously:
- a **research portal** (study results, methods);
- a **public learning space** (what is entrainment, what is complexity matching);
- a **collective gathering place** for stories, myths, and lived experiences of connection with land, water, organisms, and elemental forces;
- and an **experimental instrument** that gathers phenomenological data from visitors interacting with generated nature stimuli.

These four functions must feel like one continuous world, not four tabs of a corporate site.

### Aesthetic principles

**We want:**
- Multiscale visual logic — micro to macro, tissue to landscape, neuron to forest.
- Rhythm, oscillation, breath, coupling, phase. Things that move together and apart.
- Complexity that *rewards* attention rather than performing busyness.
- Typography and spacing that invite slowing down.
- Sound, optionally and respectfully (never autoplay).
- Scientific rigor that is *aesthetically present* — equations, signal traces, phase plots can be beautiful when treated with care.

**We do not want:**
- Stock leaf-and-forest imagery.
- Sage/spa/wellness palettes. No mandalas, no "vibes".
- New-age generative blob aesthetics that signal "AI art, 2023".
- Hero video of a sunlit waterfall.
- Any phrase along the lines of "reconnect with your inner self".
- Generic dark-mode marketing-site polish.

When in doubt, ask: *would a serious phenomenologist and a serious neuroscientist both feel this site is honest?* If no, redesign.

---

## 2. Tech stack

Default choices. Deviate only with reason and surface the reason in the PR.

- **Framework:** Next.js (App Router) in TypeScript. Justification: handles content + heavy interactivity, deploys cleanly to Cloudflare Pages via `@cloudflare/next-on-pages`, plays well with Remotion, MDX, and React-based map/3D libraries. If you have a strong case for Astro (with React islands) or Remix instead, raise it before scaffolding.
- **Hosting + edge:** Cloudflare Pages.
- **Database:** Cloudflare D1 (SQLite at the edge) — for stories, questionnaire responses, experiment trials.
- **Object storage:** Cloudflare R2 — for audio recordings, generated stimuli videos, large media.
- **Backend logic:** Cloudflare Workers (or Next.js route handlers running on Pages Functions, depending on what scaffolds cleanly).
- **Transcription / AI helpers:** Cloudflare Workers AI (Whisper for voice → text, possibly an embedding model for clustering stories later).
- **Educational animations:** Remotion. Render to MP4/WebM, store in R2, embed in the educational section. Where interactivity is essential, use plain React + Framer Motion / GSAP instead of a baked video.
- **Map:** MapLibre GL JS (open source, no Mapbox token required) with a custom style — stylized rather than realistic. Avoid the default streets look entirely.
- **Motion:** Framer Motion for component-level, GSAP for orchestrated sequences, Lenis for smooth scroll if used (use sparingly).
- **3D / shader work, if needed:** React Three Fiber + drei. Reach for shaders only when 2D would lose meaning.
- **Forms / questionnaire:** React Hook Form + Zod for schema validation.
- **Styling:** Tailwind CSS with a small, custom design-token layer. No off-the-shelf component kits that will impose their visual language (no shadcn defaults shipped as-is — fine as a starting point if fully restyled).
- **Content authoring:** MDX for educational and science sections so we can mix prose, equations (KaTeX), and embedded React components.

---

## 3. Repository layout

Bootstrap deviated from the original monorepo proposal — see §3.1 for the rationale. Actual layout:

```
/
├── CLAUDE.md                  # this file (operating manual)
├── README.md                  # project README + manual Cloudflare setup
├── AGENTS.md                  # Next.js's own note to agents (do not delete)
├── package.json               # one root package.json — Next.js + Remotion share deps
├── next.config.ts             # initOpenNextCloudflareForDev() wired in
├── wrangler.jsonc             # Cloudflare Worker config (D1, R2, ASSETS bindings)
├── open-next.config.ts        # OpenNext Cloudflare adapter config
├── remotion.config.ts
├── tsconfig.json / postcss.config.mjs / eslint.config.mjs / .gitignore
├── docs/                      # to be created — grant PDF + design refs + strategies
├── src/
│   └── app/                   # Next.js App Router
│       ├── layout.tsx
│       ├── page.tsx           # bootstrap placeholder landing
│       └── globals.css        # Tailwind 4 + design-token scaffold
│       (sections to be added: science/, learn/, stories/, experiment/, api/)
├── public/                    # static assets served at /
├── remotion/
│   ├── README.md
│   └── src/
│       ├── index.ts           # registerRoot
│       ├── Root.tsx           # composition registry
│       ├── HelloWorld.tsx     # bootstrap placeholder
│       └── concepts/          # to be added — one file per educational concept
└── db/
    ├── README.md
    └── migrations/
        └── 0001_init.sql      # initial schema, applied via Wrangler
```

### 3.1 Deviations from the original proposal

- **Flat layout, not a monorepo.** Single Next.js app at the repo root with `remotion/` / `db/` / `docs/` as siblings. We have one app, not a fleet — the ceremony of `apps/web/` adds nothing here.
- **Cloudflare Workers (via OpenNext), not Pages.** Next.js 16's recommended Cloudflare path is the OpenNext adapter (`@opennextjs/cloudflare`) deploying to Workers. The older `@cloudflare/next-on-pages` is edge-runtime only and lags behind Next releases. OpenNext gives full Next.js compatibility (App Router, server components, server actions) on Workers, with the same D1/R2/KV bindings.
- **No separate `workers/` folder.** API endpoints live in Next.js App Router route handlers under `src/app/api/`. The Cloudflare Worker is the OpenNext-built worker that serves the whole app; bindings are declared in `wrangler.jsonc`.
- **No `apps/` or `scripts/` folder.** Added only when there's a real second app or script to host.
- **Cloudflare provisioning (D1 / R2 / Workers project)** is left as a manual one-time step the human has to run — see [README.md](README.md). We do not automate `wrangler login` or resource creation.

Adjust if a cleaner structure emerges, but document the change in this file.

---

## 4. Section-by-section specifications

### Section 1 — Science / Results

**Content available now is limited.** Expect: a handful of figures, a methods description, and possibly one methods animation.

Build a structure that is **honest about its current sparseness** rather than padding it with placeholder lorem-ipsum. Treat it as a living lab notebook page that can grow.

- A short, plainly written abstract of the study on human–environment coupling.
- A "Methods" subsection where the methods animation lives (we may render this with Remotion or build it interactively — propose both options with trade-offs before committing).
- A "Findings so far" area with the existing figures, captioned carefully.
- A "What's next" note. It is fine — preferable, even — for this section to read as in-progress.

Figures should be presented at full intellectual seriousness: real captions, axis labels legible, source linked to the grant.

### Section 2 — Educational

The teaching core. Topics, in roughly increasing depth:

1. **What is entrainment?**
2. **Forms of coupling** (unidirectional, bidirectional, mutual; physiological, behavioral, environmental).
3. **Complexity matching** — what it is, why it matters, how it's measured.
4. (Add more as the strategies docs suggest.)

For each concept:

- A short Remotion-rendered animation (10–40s) that conveys the *intuition* of the concept. Not a lecture — a visual epiphany.
- A prose explanation in MDX, with one or two interactive React components where the reader can perturb a parameter and see the effect (e.g. drag a coupling-strength slider on two oscillators and watch them lock).
- An optional "Read more" with citations from the grant.

**Use Remotion for non-interactive animations.** Keep individual compositions short and composable. Render to WebM (VP9) for the web; MP4 fallback. Store in R2, served behind the Pages deployment.

Where interactivity meaningfully helps understanding, build a live React component instead of a pre-rendered video. Coupled oscillators, Lissajous, and complexity-matching demos all benefit from being live.

### Section 3 — Stories, Myths, and People (and Animals) of the Land

The most ambitious section. Treat it as the heart of the site.

#### 3.1 The map

- A full-page, stylized world map (MapLibre, custom style — muted, dreamlike, definitely not Google Maps blue).
- Each shared story is a point. Clustering at low zoom.
- Clicking a point opens a card with the story (text or audio playback), category badges, and an optional anonymous attribution.
- Filters by category (see 3.3) and by "personal story" vs "folklore / inherited story".
- Search is fine but secondary. The primary affordance is *wandering*.

#### 3.2 Sharing flow

A user shares either:

- a **personal** story of connection with nature, or
- a **folklore / inherited** story (myth, family story, story of the land).

Steps:

1. **Locate.** User drops a pin on the map (or grants geolocation).
2. **Choose what they were connected to.** Via a **wheel-of-choice** interface (or a thoughtful alternative — propose two designs before building). Multi-select. Suggested top-level categories, refine with us:
   - **Landscapes:** forest, sea, desert, mountain, river, wetland, grassland, ice, urban-wild, cave, sky.
   - **Organisms:** plants, animals, insects, fungi, microbial — with optional free-text specification (a specific oak, a specific dog, etc.).
   - **Forces / elements:** wind, fire, water, earth, light, darkness, weather (storm, rain, snow).
   - **Time / cycles:** dawn, dusk, season, tide, lunar.
3. **Tell the story.** User can **speak** (voice recording, transcribed via Workers AI Whisper, both audio and transcript stored) **or write**. Voice is the default — it carries the body.
4. **Brief consent screen.** What we'll do with the data, that it may appear publicly on the map, that they can request deletion. Plain language.
5. **Optional 5-minute questionnaire** (see 3.4). Frame as an invitation, never a wall.

#### 3.3 Categories and gamification

"Gamify" here does **not** mean points and badges. It means the act of contributing should feel like placing a small light on a dark map, and seeing the map slowly become inhabited.

- Show, after submission, a quiet animation of the user's pin joining others nearby — "you are not alone in attending to this place".
- Allow the user to *return* to their story and see what others have shared in the same biome / about the same element.
- Aggregate views: "stories of the wind", "stories of the desert", "stories told to children" — beautiful filtered constellations.
- No streaks. No leaderboards.

#### 3.4 The questionnaire (~5 min)

Designed to gather phenomenological dimensions, with a particular focus on **memory attached to place**. The exact instrument should be co-designed with the science team — leave a clear extension point in the schema for adding/removing items without migration pain. Likely dimensions, to confirm with the team:

- Vividness of recall.
- Sensory channels engaged (sight, sound, smell, touch, proprioception).
- Felt sense of being-with vs. observing.
- Time depth (recent, childhood, ancestral).
- Affective tone.
- Embodied resonance now, while telling.

Use a mix of Likert sliders, semantic differentials, and one or two short free-text prompts. Persist partial answers. Allow exit at any point with thanks.

### Section 4 — Experiment with generated stimuli

A research-grade data-collection instrument disguised as an experience.

- A library of generated nature videos (stored in R2; metadata in D1).
- The user is shown a sequence of videos (short — seconds to a minute). Sequencing strategy is configurable from the science side: random, balanced, adaptive — leave the strategy pluggable.
- After each video, the user reports phenomenological response. Same instrument family as 3.4 but tighter — designed for repeated measures.
- Strict consent flow at entry: this is research, here is what we collect, here is how to withdraw. IRB-grade language — coordinate with the team for the exact wording.
- Data export for the science team: CSV/Parquet dump endpoint, gated.
- Session resumption if the user closes the tab.

Treat this section's UX as the most controlled on the site — fewer flourishes, tighter timing, no surprise animations during a trial.

---

## 5. Data & backend

### D1 schema sketch (refine in `db/schema.sql`)

- `stories(id, lat, lng, kind /* personal | folklore */, body_text, audio_r2_key, transcript, created_at, language, anon_handle, status)`
- `story_categories(story_id, category, subcategory)` — many-to-many over the wheel selections.
- `questionnaire_responses(id, story_id?, session_id, item_key, value_numeric, value_text, created_at)` — long format, schema-flexible.
- `experiment_sessions(id, consent_version, created_at, ua_hash, ...)`
- `experiment_trials(id, session_id, stimulus_id, started_at, ended_at, ...)`
- `experiment_responses(trial_id, item_key, value_numeric, value_text)`
- `stimuli(id, r2_key, duration_s, generation_metadata_json, ...)`

### R2 buckets

- `audio/` — story voice recordings.
- `stimuli/` — experiment videos.
- `educational-renders/` — Remotion outputs.

### Workers / endpoints

- `POST /api/stories` — create.
- `POST /api/stories/:id/audio` — pre-signed R2 upload, then transcription job.
- `GET /api/stories` — list with bbox + filters.
- `POST /api/questionnaire` — append responses.
- `POST /api/experiment/session` / `POST /api/experiment/trial` / `POST /api/experiment/response`.
- `GET /api/export/*` — gated.

### Privacy

- Default everything to anonymous. Optional handle, never an email.
- Visible deletion path on every story page.
- Plain-language privacy note linked from every form.
- Treat coordinates with care — offer "approximate location" toggle that fuzzes the pin to ~1 km for sensitive places.

---

## 6. Working agreement with the agent (you)

### Iteration order

1. **Bootstrap.** Scaffold Next.js + Cloudflare Pages + D1 + R2 wiring + Remotion + Tailwind. Get a deploy preview live from day one.
2. **Design system.** Propose 2–3 distinct directions for the visual language (color, type, motion, sample landing screen). Show screenshots in a PR. Wait for human review.
3. **Section 2 (Educational).** Well-scoped, lets us prove out Remotion + MDX + interactive components.
4. **Section 3 (Stories).** Largest. Build the map + share flow before the questionnaire.
5. **Section 4 (Experiment).** Once data plumbing from Section 3 is solid, this reuses much of it.
6. **Section 1 (Science).** Lightest content; build last so it inherits the mature design system.
7. **Landing / intro.** Build *last*, when you know the site well enough to introduce it.

### How to work

- Branch per feature. Open PRs with screenshots / screen recordings on every visual change.
- For any non-trivial design decision, propose **two or three options** with trade-offs before committing. Especially for: the wheel-of-choice, the map style, the educational animation aesthetic, and the landing.
- Keep PRs reviewable. < 800 lines diff is the target.
- After each merged section, write a short retro at the bottom of this file (see §9) noting what changed and why.
- Never autoplay audio or video. Never block the page on a modal cookie banner — we don't need one with this stack if we keep analytics off or on a privacy-respecting solution.
- Accessibility is non-negotiable: keyboard-navigable wheel, captions on every video, transcripts for every story audio, color contrast checked, prefers-reduced-motion respected.
- Performance budget: LCP under 2.5 s on a mid-tier mobile, JS under 200 kB on the landing. Map and experiment pages can be heavier but lazy-load.

### When to stop and ask

- Anything touching consent / data-handling wording.
- Anything where the science meaning isn't clear from the grant — ask, don't invent.
- Choice of wheel-of-choice mechanic.
- Map base style.
- Whether to autoplay anything (default: no).

---

## 7. Open questions for the human team

The agent should keep this list current and surface answers in PRs. Answered items are kept here for context.

**Open**
- Final list of wheel categories and subcategories.
- Final questionnaire instrument (3.4 and Section 4).
- Whether stories are moderated before appearing on the map, or appear immediately with a flag/report option. (DB default is `pending` so we can add moderation without migration.)
- Analytics: none, Plausible, or self-hosted?

**Resolved**
- *Site identity.* "Attuning to Nature" is the public title. No funder visibility.
- *Languages at launch.* English only.
- *Domain.* `attuningtonature.earth` is registered. Cloudflare zone setup TBD by the human at deploy time.
- *Section 3 (stories) status.* Public-engagement layer only. No scientific use of submitted stories at launch. IRB to be considered separately if that ever changes.
- *Section 4 (experiment).* Treated as a parallel scientific dataset (option c). Until IRB is in place: build the full UX and data plumbing, but the "save response to DB" path is gated behind a feature flag (default OFF), with a visible "preview — your responses are not stored" notice. Flip the flag once consent + IRB land.
- *Stimuli videos.* In progress. Use placeholders for now.
- *Image bank.* None yet. Use neutral placeholders; ingest into R2 when available.
- *HumanNatureAttunement repo.* Read-only context (methods, schema reference). This repo is the website's frontend + backend.
- *Atmos as aesthetic anchor.* One reference among several. Site sits between science, art, and storytelling — not Atmos-as-pastiche.

---

## 8. Initial tasks (first week)

1. Confirm you can read every doc in `/docs/`. List anything missing or unreadable.
2. Scaffold the monorepo as in §3. Get a Cloudflare Pages preview deploying on every push.
3. Stand up D1 + R2 with the schema in §5 (initial migration).
4. Build a Remotion "hello world" composition and render it through to R2.
5. Open a PR with **2–3 design directions** for the visual language, each rendered as a static landing-page mock plus a one-paragraph rationale tying it to §1.
6. Wait for direction before continuing into Section 2.

---

## 9. Change log (append-only)

> Every merged section adds a dated note here. Format: `YYYY-MM-DD — section — what changed — why`.

- 2026-05-01 — bootstrap — Scaffolded Next.js 16 (App Router, TypeScript, Tailwind 4) at repo root; added Remotion (`remotion/`) with a hello-world composition; added D1 schema and first migration (`db/migrations/0001_init.sql`); wired the OpenNext Cloudflare adapter (`@opennextjs/cloudflare`), `wrangler.jsonc` with bindings for D1 + four R2 buckets, and dev/preview/deploy scripts. Replaced the Vercel boilerplate landing with a minimal placeholder. — *Why:* a single coherent surface to iterate on; modern Cloudflare Workers path supports Next 16 features the older Pages adapter does not; flat layout (rather than a monorepo) keeps navigation cheap for a single-app project.
