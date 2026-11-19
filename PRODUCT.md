# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

Existing codebase: React 19, TypeScript, Vite, Tailwind CSS v4, Canvas 2D, Web Workers, Zustand, React Router. Ships as a web app, an installable PWA, and a Capacitor Android app built from the same source.

## Users

People who want to turn a live camera feed or a photo into stylized text and dithered graphics: ASCII-art and terminal-aesthetic enthusiasts, retro-computing fans, and anyone who wants a distinctive portrait, wallpaper, or shareable still without uploading media to a server.

## Product Purpose

Phosphor Cam renders a camera stream or a still photo as character art, dither, halftone, voxel, or line art in real time on the canvas. It exists to make a live camera and a photo editor feel like a terminal-native art tool. Success means the render is immediate, the controls are precise, and the captured or exported result matches the preview.

## Positioning

Five interchangeable render engines run over the same local pipeline, in a live camera and a photo studio, entirely client-side. Media never leaves the device. The camera and Studio share the same renderers and settings controls, so a look tuned live can be reproduced on a photo.

## Operating Context

- The camera screen is used continuously while framing, tuning, and recording, often one-handed on a phone.
- Studio is used with a still image loaded from a file, drag-and-drop, clipboard paste, or a built-in sample.
- Settings are adjusted frequently and repeatedly, sometimes while the camera is live.
- The Android build is expected to work fully offline after install.
- Captures and exports are downloaded or saved to the device; the ASCII output can also be copied as text.

## Capabilities and Constraints

- Routes: `/` for the live camera, `/studio` for photo editing.
- Render engines: ASCII, Dither, Halftone, Voxel, Lines.
- ASCII character sets: 22 sets, including standard ramps, blocks, braille, runes, and lines.
- Shared controls: character size 2–30 px, contrast 0.5–3.0x, brightness −100 to +100, color mode, invert, foreground/background colors, six color presets plus custom hex.
- Effects: glow, bloom, halation, chromatic aberration, vignette, scanlines, grain, each with an on/off state and intensity.
- Camera: front/back switching, mirrored front preview, photo capture, video recording of the rendered output, clipboard copy of ASCII text, live FPS and render-time readout.
- Studio: presets, zoom, pan, pinch and double-click zoom, hold-to-compare against the original, undo/redo, reset, and export. Video editing is planned for a later release.
- Capture: scale 1x–20x, PNG/JPEG/WEBP output. Images are downscaled to at most 1600 px on the long edge before editing.
- Keyboard: `Esc` closes the settings panel; `Ctrl`/`Cmd`+`Z` and `Ctrl`/`Cmd`+`Shift`+`Z`/`Ctrl`+`Y` undo and redo in Studio.
- Browser support requires `getUserMedia`, Canvas 2D, and ES2020+.

## Brand Commitments

- Name: Phosphor Cam. The Studio side is Phosphor Studio.
- The phosphor green accent is tied to the logo and the terminal/CRT reference.
- Voice: technical, direct, and terse; the interface is an instrument, not a marketing page.

## Evidence on Hand

- Logo: `public/assets/logo.png`.
- Banner and demo renders: `public/assets/banner.png`, `public/demo/`.
- Product walkthrough and feature list: `README.md`.
- Android build configuration and release scripts: `android/`, `fastlane/`, `capacitor.config.ts`.
- No testimonials, customer logos, benchmarks, or pricing claims exist; do not fabricate them.

## Product Principles

1. **The render is the interface.** Chrome stays quiet and out of the way; the canvas is the primary surface.
2. **Local by default.** Camera frames and photos are processed on-device and never uploaded.
3. **One pipeline, two surfaces.** Camera and Studio share renderers, settings, and visual language.
4. **Precision over decoration.** Controls read as instrument readouts: compact, monospaced, and tabular.
5. **Immediate feedback.** Every adjustment is visible in the live preview without a confirm step.

## Accessibility & Inclusion

- Touch targets are at least 44 px on mobile.
- Focus is visible on every interactive element through the signal-green focus ring.
- Reduced-motion and reduced-transparency preferences are respected.
- The interface must remain operable at 360 px width.
