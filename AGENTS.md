# AGENTS.md

## Commands

- Bun is the package manager (`bun@1.4.0` in `.bun-version`, `bun.lock`); CI uses `bun install --frozen-lockfile`. Ignore CONTRIBUTING.md's npm instructions.
- `bun run dev` — Vite on `http://localhost:5173` (camera needs HTTPS or localhost).
- `bun run build` — `tsc -b && bun --bun vite build`; `bun run preview` serves `dist/`.
- CI gate, in order: `bun run format:check` → `bun run lint` → `bun run typecheck` → `bun run build`.
- `bun run typecheck` checks nothing: root `tsconfig.json` has `files: []` and only references `tsconfig.node.json`, so `tsc --noEmit` loads zero source files. Use `bunx tsc -b` (or `bun run build`) for a real typecheck.
- There is no test suite; the CI job named `test` only runs lint/typecheck/build. Verify with the CI chain plus a manual browser check — don't claim tests passed.
- Formatting is oxfmt (double quotes, semicolons, 80 cols, LF, sorted imports and Tailwind classes). Run `bun run format`; husky + lint-staged also runs on commit.

## Architecture

- React 19 + TypeScript + Vite + Tailwind v4 + Zustand. `@/` maps to `src/` in both Vite and TS. Fully client-side; no API or backend.
- Routes in `src/App.tsx`: `/` camera, `/studio` empty state, `/studio/edit` editor. Opening `/studio/edit` without a loaded image redirects to `/studio`.
- Render path: source frame → `downsampleFrame` → renderer from `RENDERERS` (`src/core/renderers/registry.ts`) → `runEffectPipeline` → canvas. Both surfaces run this in a module worker with `OffscreenCanvas`; main-thread controllers only send bitmaps and settings.
- `src/core/` is worker-safe shared code: no React or `window`/`document`. `src/features/cam` and `src/features/studio` own their stores, workers, and UI. `src/shared` holds the settings contract, constants, and controls used by both.
- `AsciiSettings` is the single settings shape for camera and Studio. Adding a control generally touches `src/shared/types/ascii.ts`, `src/shared/constants/defaultSettings.ts`, desktop UI in `src/shared/components/settings/desktop/`, mobile UI in `src/shared/components/settings/mobile/tools/`, and possibly `src/features/studio/constants/presets.ts`.
- Effects run in fixed order from `EFFECT_PIPELINE` (chromatic aberration → glow → bloom → halation → vignette → scanlines → grain). Order changes output; don't reorder casually.
- Adding a render mode: extend `RenderMode`, add a factory to `RENDERERS`, add a label to `RENDER_MODES`, and implement the `RendererInstance` interface (optional `captureImage`/`getAsciiText`).
- `CHAR_SETS` has 22 sets, but `AsciiSettings["characterSet"]` is still a 5-value union and the pickers cast around it. Widen the union when adding sets.

## Gotchas

- README and `index.html` marketing copy lags the code: `index.html` says 5 character sets and "4K"; actual is 22 sets and 1×–20× export. README says "color wheel"; actual UI is H/S/B sliders. Derive behavior from `src/`, not prose.
- Version lives in `src/features/cam/constants/version.ts` (`v1.4.0`) and `android/app/build.gradle` (`versionName`/`versionCode`). `package.json` is intentionally `0.0.0` and is not the source of truth.
- Studio intentionally downscales uploads to a 1600 px long edge / viewport pixel budget (`getStudioSourceSize`). It keeps previews and 20× exports from allocating huge canvases; don't remove it as an "optimization".
- `public/sw.js` is hand-written and registered only in production builds. It can serve cached shell/assets after a deploy; test with a fresh profile or cleared site data.
- Native is Capacitor Android (`site.aroy.phosphor`). Guard `Filesystem`/`App`/`StatusBar` behind `isNative()`; run `bun run android:sync` after web changes. `android:dev` needs a connected device with `adb reverse`.
- Static discovery files live in `public/`: `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `humans.txt`, `.well-known/security.txt`. Update them when routes or features change.
- Don't edit `dist/` (generated). `archive/` is old, gitignored material, not current docs.
- `PRODUCT.md` forbids fabricated social proof, benchmarks, and pricing claims; don't invent them in docs or metadata.

## Delivery

- Push/merge to `main` → CI "Lint & Build" → `deploy.yml` deploys `dist/` to Cloudflare Pages. There is no manual deploy step.
- Publishing a GitHub release triggers `android-release.yml`, which builds, signs, and attaches the APK. Local `bun run android:release` needs the `ANDROID_*` signing variables in `.env` (gitignored).
