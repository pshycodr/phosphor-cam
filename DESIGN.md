---
name: Phosphor Cam
description: Real-time ASCII art camera and photo studio
colors:
  ink: "#080908"
  ink-2: "#0e100f"
  ink-3: "#141715"
  ink-4: "#1b1f1c"
  line: "#242925"
  line-strong: "#3a423c"
  paper: "#e6ebe7"
  muted: "#98a29b"
  faint: "#6b756e"
  signal: "#38f370"
  signal-soft: "#7bf9a2"
  alert: "#ff6b5a"
typography:
  display:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.18em"
  body:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.12em"
rounded:
  control: "999px"
  panel: "22px"
  card: "12px"
  small: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-signal:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  field:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.paper}"
    rounded: "{rounded.small}"
    height: "40px"
  panel:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
---

# Design System: Phosphor Cam

## Overview

**Creative North Star: "The Terminal Instrument"**

Phosphor Cam looks like a precision camera built into a terminal. The canvas is the only bright object; every control is compact, monospaced, and arranged at the edges of the frame like readouts on a device. Surfaces are near-black graphite, separated by hairline borders and tonal steps rather than heavy panels. The phosphor green is a signal, not a theme: it appears only where the machine is active, recording, successful, or focused.

The system favors restraint and density over decoration. Type is uniformly monospaced, numeric values are tabular, labels are small and tracked, and controls are pill-shaped so they read as physical instrument keys. Motion is short and eased out; nothing animates on page load, and nothing animates on keyboard or high-frequency actions.

**Key Characteristics:**

- Full-bleed camera with floating chrome at the four edges.
- JetBrains Mono only, at 9–13 px, with uppercase tracked labels.
- Layered graphite neutrals plus one signal green.
- Pills, hairlines, and soft tonal surfaces; almost no large radii except the mobile sheet.
- Quiet state motion, 120–260 ms, strong ease-out.

## Colors

The palette is a graphite stack with a single phosphor-green accent. There is no secondary hue; warmth and hierarchy come from luminance alone.

### Primary

- **Phosphor Signal** (#38f370): recording dots, active switches and segmented selections, enabled effect states, focus rings, selection, success icons, and the key value in an active control. It is the only chromatic color in the chrome.
- **Phosphor Soft** (#7bf9a2): hover state for signal-filled buttons only.

### Neutral

- **Terminal Ink** (#080908): page background, camera letterbox, and the base of every gradient.
- **Console Ink** (#0e100f): floating bars, rails, sheets, and input wells.
- **Raised Ink** (#141715): hover fills, inactive switch tracks, and grouping bands.
- **High Ink** (#1b1f1c): pressed and selected neutral surfaces.
- **Hairline** (#242925): default borders and dividers.
- **Strong Hairline** (#3a423c): control borders, slider track, scrollbar thumb.
- **Paper** (#e6ebe7): primary text, active pill fill, and shutter fill.
- **Muted** (#98a29b): secondary labels and inactive tab text.
- **Faint** (#6b756e): tertiary metadata, hints, and disabled labels.
- **Alert** (#ff6b5a): destructive hover and error icons only.

### Named Rules

**The Signal-Only Rule.** Green marks state, not decoration. If an element is not active, recording, successful, or focused, it stays monochrome.

**The One Accent Rule.** No second accent color enters the chrome. Image content may be any color; the interface may not.

## Typography

**Display Font:** JetBrains Mono (with ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)
**Body Font:** JetBrains Mono (same stack)
**Label Font:** JetBrains Mono (same stack)

**Character:** One family, three jobs. Small tracked uppercase labels act as instrument legends; 11–13 px regular text carries names and values; semibold tracked uppercase marks the product wordmark and section headers. Tabular numerals keep FPS, render time, dimensions, and slider values from shifting.

### Hierarchy

- **Wordmark** (600, 11 px, 0.16–0.18em, uppercase): product name in the camera and Studio headers only.
- **Section header** (500–600, 10–11 px, 0.12–0.2em, uppercase): settings section titles, active mobile tool name, signal green when it names the open panel.
- **Label** (500, 10–12 px, 0.12em where uppercase): control labels, segmented options, tool tabs, metadata rows.
- **Body** (400, 13 px, 1.5): descriptions, hints, and empty-state copy; measure stays short inside narrow panels.
- **Value** (400–500, 10–13 px, tabular): FPS, ms, px, x-scale, hex codes, percentages.

### Named Rules

**The Mono-Only Rule.** No serif, no grotesque, no display face. Every glyph in the product is JetBrains Mono.

**The Tabular Rule.** Any number that updates live uses tabular numerals.

## Layout

The camera is a fixed, full-viewport stage. A slim top bar carries the wordmark, status readouts, and the Studio/settings actions. The capture controls float at the bottom center on desktop and tablet, inside a floating card.

Below 640 px the camera switches to a phone composition: a single compact stats bar with the phosphor logo and a Studio pill at the top, an inset preview card with a 26 px radius and a faint signal glow, and a bottom row of four labeled actions (Flip, Capture, Copy, Edit) with Photo/Video above it. The capture card fills the space between the top bar and the control row, and its rendered frame size follows the card, so the preview and the saved capture match.

On screens 640 px and wider, settings open as a 360 px right rail with a hairline left border and a soft cast shadow; the capture bar shifts left of the rail at 1024 px and hides below that width while settings are open. Below 640 px, settings open as a bottom sheet with a 22 px top radius, a drag handle, and a seven-tool tab bar sized to fit 360 px.

Studio uses a three-part layout: a 56 px header, a flexible viewport, and a 344 px inspector on the right at desktop sizes. Below 1024 px the inspector becomes a persistent, draggable bottom sheet with the same tab bar.

Spacing is tight and rhythmic: 4 px inside controls, 8–12 px between related items, 16–24 px between groups. Panels use 16 px horizontal padding; the mobile sheet uses 16 px with safe-area insets on all sides.

## Elevation & Depth

Depth is tonal first and shadowed second. Floating chrome sits on translucent `ink-2` with a 12–24 px backdrop blur and a hairline border; the page itself stays flat. Shadows are used only for elements that genuinely leave the surface: the settings rail (`-24px 0 60px rgba(0,0,0,0.45)`), the mobile sheet (`0 -20px 50px rgba(0,0,0,0.5)`), toasts (`0 12px 32px rgba(0,0,0,0.45)`), and the export dialog. The capture bar and header do not cast shadows; a bottom gradient protects the controls from bright camera content.

### Named Rules

**The Flat-At-Rest Rule.** Controls never sit on their own cards. A control is a border, a fill, or a line, not a raised tile.

## Shapes

The form language is the pill and the hairline. Buttons, switches, segmented controls, chips, tabs, and icon buttons are fully rounded. Panels use 12 px corners; the mobile sheet alone uses 22 px on its top edge. Borders are 1 px at `line` or `line-strong`; dividers are 1 px and low contrast. The shutter is a double ring: a thin outer ring and a paper-filled inner disc, with a square inner form in video mode.

## Components

### Buttons

- **Shape:** fully rounded pill (`border-radius: 999px`), 44 px default height.
- **Primary:** paper fill, ink text; used for one decisive action per surface (Export).
- **Signal:** phosphor fill, ink text; used for confirmation and active commitment.
- **Outline:** transparent with a hairline border; the default secondary action.
- **Ghost / Quiet:** text-only, muted or faint, gaining `ink-3` and paper text on hover.
- **Hover / Focus:** 180 ms color and border transition; 2 px signal focus ring with 2 px offset; press scales to 0.97 over 120 ms.
- **Disabled:** 40% opacity, pointer events off.

### Controls

- **Switch:** 24 × 40 px track, 16 px thumb; signal track and ink thumb when checked, hairline track and muted thumb when off; invisible 10 px hit-area extension.
- **Segmented:** pill group on `ink-2` with a paper slider that translates in 200 ms; active label turns ink.
- **Range:** 2 px track, signal fill up to the value, 12 px paper thumb with an ink halo; the thumb grows on press and gains a signal ring on focus.
- **Field:** label and tabular value on one baseline, control below, optional faint hint.

### Chips

- Fully rounded, `min-height: 44px` on mobile, hairline border; active chips switch to a signal-tinted border and text.

### Panels and Sheets

- **Desktop rail:** 360 px, `ink` at 95% with blur, hairline left border, sections as full-width disclosure rows with 56 px minimum height.
- **Mobile sheet:** `ink-2` at 95%, 22 px top radius, drag-to-dismiss after 96 px or 0.6 velocity, safe-area padding, tab bar fixed to the bottom.
- **Section headers:** 10–12 px tracked uppercase, a plus/minus or chevron affordance, and a value summary on the right in faint text.

### Navigation

- **Camera header:** logo, wordmark, optional FPS/render/resolution readout pill, Studio action, settings action. All actions are 44 px pills or icon buttons on translucent surfaces. On phones the readouts sit in one compact pill on the left — plain logo, then `FPS`, render ms and frame size — and one row on the right: a round, icon-only Settings island with a gear, immediately left of the Studio pill. Both islands are 44 px tall and fully rounded.
- **Mobile settings menu:** a popover anchored under the Settings island holding aspect ratio (`1:1`, `3:4`, `Full`, defaulting to `3:4`), capture format and capture scale, and About. Choosing a ratio applies and closes it; it also closes on outside press or `Esc` and returns focus to the gear. It is separate from the editing sheet.
- **Mobile capture row:** four labeled actions on the bare ink surface, no card. Flip sits close to the centered shutter; Copy and Edit share a two-cell grid to its right. Copy is shown only for the ASCII renderer, and Edit slides into Copy's cell whenever the renderer is not ASCII. Side targets are 48 px with 9 px tracked labels; the shutter is 80 px.
- **Studio header:** back-to-camera link, logo, Studio wordmark, centered file metadata at desktop, Compare and Export actions. Mobile shows icon-plus-label actions and hides non-essential metadata.
- **Mobile dock:** up to seven icon-and-label tabs, `basis-[50px]`, active tab in signal green with a small top indicator; when the dock is dismissible a 48 px close button sits at its far left, and the open sheet keeps a collapse chevron.

### Signature Components

- **Shutter:** 78–84 px double ring on desktop and 80 px on phones; paper inner disc for photo, square for video, signal outer ring with a soft glow while recording or pressed.
- **Viewfinder:** the frame is a window onto the stream, never a scaled stream. The camera is drawn through a center crop (`object-fit: cover` math) into a canvas at the frame's ratio, mirrored after the crop, and every renderer, photo capture, recording and copied ASCII samples that same cropped canvas. Only the visible area changes between ratios; people and objects keep their shape. Below 640 px the frame is an inset rounded card with a hairline signal border and a faint outer glow for `1:1` and `3:4`; `Full` fills `100vw × 100dvh` and the header and dock overlay it.
- **Compare control:** press-and-hold crossfade to the original; signal border and text while held, 140 ms opacity crossfade.
- **Export dialog:** centered panel over a dimmed backdrop, 44 px close target, focus trapped, `Esc` closes, focus returns to the trigger.

## Do's and Don'ts

### Do:

- **Do** keep the canvas dominant and the chrome at the edges.
- **Do** use signal green only for active, recording, success, and focus states.
- **Do** use tabular numerals for every live value.
- **Do** keep mobile touch targets at 44 px or larger and respect safe-area insets.
- **Do** use 120–260 ms transitions with `cubic-bezier(0.23, 1, 0.32, 1)`.
- **Do** respect `prefers-reduced-motion` and `prefers-reduced-transparency`.

### Don't:

- **Don't** introduce a second typeface or a serif display face.
- **Don't** use green as a background wash, gradient, or decorative highlight.
- **Don't** wrap controls in raised cards or add drop shadows to resting chrome.
- **Don't** animate page load, keyboard actions, or high-frequency interactions.
- **Don't** use pure black or pure white surfaces; stay on the graphite stack.
