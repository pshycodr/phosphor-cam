<div align="center">
  <img src="public/assets/banner.png" alt="Project Logo" width="full">

# Phosphor Cam

  <p align="center">
    <i>Transform your camera feed into real-time ASCII art</i>
  </p>

[![GitHub stars](https://img.shields.io/github/stars/pshycodr/phosphor-cam?style=social)](https://github.com/pshycodr/phosphor-cam/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/pshycodr/phosphor-cam?style=social)](https://github.com/pshycodr/phosphor-cam/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/pshycodr/phosphor-cam?style=social)](https://github.com/pshycodr/phosphor-cam/watchers)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CI](https://github.com/pshycodr/phosphor-cam/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/pshycodr/phosphor-cam/actions/workflows/ci.yml?query=branch%3Amain)
[![Android Release](https://img.shields.io/github/v/release/pshycodr/phosphor-cam?label=Android&logo=android&logoColor=white&color=3DDC84)](https://github.com/pshycodr/phosphor-cam/releases/latest)

</div>

<div align="center">
  <a href="https://github.com/pshycodr/phosphor-cam/releases/latest">
    <img src="https://img.shields.io/badge/Download-Latest%20APK-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Download latest APK">
  </a>
</div>

---

## Overview

Phosphor Cam converts a live camera stream into stylized text or dithered bitmap graphics on an HTML canvas. It runs entirely client-side: frames are read from the `MediaStream`, processed and drawn locally, and are never uploaded.

Five render engines are available and can be switched at runtime without restarting the camera:

| Engine       | Output                                                                        | Typical use                         |
| ------------ | ----------------------------------------------------------------------------- | ----------------------------------- |
| **ASCII**    | Characters mapped to pixel luminance, optionally tinted with the source color | Text-art portraits, copyable output |
| **Dither**   | Reduced-tone bitmap rendering with a retro, print-like texture                | Stylized stills and video           |
| **Halftone** | Recreates an image as a grid of dots                                          | Stylized stills and video           |
| **Voxel**    | Render with pixeled effect and 3D blocks                                      | Stylized stills and video           |
| **Lines**    | Each row/column is one continuous ribbon                                      | Stylized stills and video           |

---

## Get the app

Phosphor Cam is available as a web app, a PWA, and a native Android app. The Android build ships from the same codebase, runs fully offline, and is signed and published automatically on every release.

<div align="center">
  <a href="https://github.com/pshycodr/phosphor-cam/releases/latest">
    <img src="https://img.shields.io/badge/Download-Latest%20APK-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Download latest APK">
  </a>
</div>

The link above always points to the latest release. Grab the `.apk` from the Assets section and install it directly — no Play Store, no account, no internet required after install.

<div align="center">
  <img src="https://github.com/user-attachments/assets/2a65e638-02ca-4e85-801d-8f720e254a6a" alt="Phosphor Cam Android app" width="70%">
</div>

---

## Demo

### ASCII

<div align="center">
  <img src="public/demo/ascii/ascii-default.png" alt="ASCII engine using the blocks character set in color mode" width="45%">
  <img src="public/demo/ascii/ascii-blocks.png" alt="ASCII engine using the standard character set" width="45%">
</div>

### Dither

<div align="center">
  <img src="public/demo/dither/dither1.png" alt="ASCII engine using the blocks character set in color mode" width="45%">
  <img src="public/demo/dither/dither-3.png" alt="ASCII engine using the standard character set" width="45%">
</div>

### Halftone

<div align="center">
  <img src="public/demo/halftone/halftone-1.png" alt="ASCII engine using the blocks character set in color mode" width="45%">
  <img src="public/demo/halftone/halftone-2.png" alt="ASCII engine using the standard character set" width="45%">
</div>

### Voxel

<div align="center">
  <img src="public/demo/voxel/voxel-1.png" alt="ASCII engine using the blocks character set in color mode" width="45%">
  <img src="public/demo/voxel/voxel-2.png" alt="ASCII engine using the standard character set" width="45%">
</div>

### Lines

<div align="center">
  <img src="public/demo/lines/lines-1.png" alt="ASCII engine using the blocks character set in color mode" width="45%">
  <img src="public/demo/lines/lines-2.png" alt="ASCII engine using the standard character set" width="45%">
</div>

---

## Table of contents

- [Get the app](#get-the-app)
- [Features](#features)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Configuration](#configuration)
- [Tech stack](#tech-stack)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Real-Time Rendering**
  - Five interchangeable render engines: ASCII, Dither, Halftone, Voxel and Lines
  - Real-time processing with a target of 60 FPS on modern hardware
  - Live FPS, render time and output resolution readout
  - Five ASCII character sets: standard, simple, blocks, matrix and edges

- **High-Quality Capture**
  - Export 4K resolution ASCII art images
  - Video recording capability

- **Customizable Settings**
  - 5 character sets (standard, simple, blocks, matrix, edges)
  - Adjustable font size/resolution (6-30px)
  - Contrast and brightness controls
  - Color mode and invert options

- **Camera Controls**
  - Front/back camera switching
  - High-quality snapshot export
  - ASCII text copy to clipboard

- **Performance Monitoring** — Real-time FPS and render time display

- **Android app** — Native, offline-first Android build, signed and published with every release

---

## Getting started

### Prerequisites

- Node.js 18 or later
- A device with a camera
- A secure context (HTTPS or `localhost`), required by browsers for camera access

### Installation

```bash
git clone https://github.com/pshycodr/phosphor-cam.git
cd phosphor-cam
npm install
```

### Development

```bash
npm run dev
```

The app is served at `http://localhost:5173`.

### Production build

```bash
npm run build
npm run preview
```

## Usage

1. **Allow camera access** when the browser prompts.
2. **Select a render engine** (ASCII, Dither, Halftone, Voxel or Lines) in the settings panel.
3. **Tune the image** under Adjustments and Appearance. Changes apply to the live feed immediately.
4. **Capture** a frame with the shutter button, or copy it as text with the copy button.
5. **Switch cameras** with the flip button.

The settings panel appears as a bottom sheet on phones (swipe down or tap outside to close) and as a side panel on larger screens (press `Esc` to close).

## Configuration

| Setting                   | Range / options                         | Engine |
| ------------------------- | --------------------------------------- | ------ |
| Render engine             | ASCII, Dither, Halftone, Voxel, Lines   | All    |
| Character size            | 2 to 30 px                              | All    |
| Contrast                  | 0.5x to 3.0x                            | All    |
| Brightness                | -100 to +100                            | All    |
| Character set             | standard, simple, blocks, matrix, edges | ASCII  |
| Color mode                | On / off                                | All    |
| Foreground and background | Any hex color, or one of six presets    | All    |
| Invert                    | On / off                                | All    |

Character size controls how large each output cell is: larger values produce fewer, coarser cells, and smaller values produce finer detail at a higher processing cost.

## Tech stack

- **React** and **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Canvas 2D API** for rendering
- **MediaStream API** for camera access
- **Capacitor** for the Android build
- **Lucide** and **React Icons** for iconography

## Browser support

Requires `getUserMedia`, Canvas 2D and ES2020+ support.

| Chrome | Firefox | Safari | Edge |
| ------ | ------- | ------ | ---- |
| 90+    | 88+     | 14+    | 90+  |

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/short-description`
3. Commit your changes with a clear message
4. Push the branch and open a pull request

To report a defect or propose a feature, [open an issue](https://github.com/pshycodr/phosphor-cam/issues).

## License

Released under the MIT License. See [LICENSE](LICENSE) for details.
