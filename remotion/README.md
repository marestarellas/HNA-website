# `remotion/`

Remotion compositions for the educational section's pre-rendered animations.

## Layout

- `src/index.ts` — registers the root.
- `src/Root.tsx` — registers each Composition by id.
- `src/HelloWorld.tsx` — bootstrap placeholder, delete once a real concept lands.
- `src/concepts/<concept>.tsx` — one file per educational concept (entrainment, complexity matching, …). Add as Section 2 work begins.

## Commands

```bash
# Open the studio (browser-based preview, hot reload)
npm run remotion:studio

# Render a composition to MP4 (or webm)
npm run remotion:render -- HelloWorld out/HelloWorld.mp4
npm run remotion:render -- HelloWorld out/HelloWorld.webm --codec=vp9
```

The first render needs a Chrome/Chromium binary. Remotion will use any installed Chrome it finds. If none is found, install one with:

```bash
npx remotion browser install
```

## Pipeline

Educational animations are rendered locally (or in CI), then uploaded to the `attuning-to-nature-renders` R2 bucket and embedded in the educational section as `<video>` elements. Use webm (vp9) for the primary source and mp4 (h264) as fallback.
