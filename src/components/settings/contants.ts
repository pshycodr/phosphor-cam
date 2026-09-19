export const SLIDER_CONFIGS = {
  fontSize: { min: 2, max: 30, step: 1, label: "Resolution" },
  contrast: { min: 0.5, max: 3.0, step: 0.1, label: "Contrast" },
  brightness: { min: -100, max: 100, step: 1, label: "Brightness" },
} as const;

export const RENDER_MODES = [{ key: "ascii", label: "ASCII" }] as const;

export const COLOR_PRESETS = [
  { name: "Matrix", foreground: "#00ff00", background: "#000000" },
  { name: "Amber", foreground: "#ffb000", background: "#000000" },
  { name: "Cyan", foreground: "#00e5ff", background: "#000000" },
  { name: "Paper", foreground: "#1a1a1a", background: "#f5f5f0" },
  { name: "Neon Pink", foreground: "#ff2e88", background: "#0a0014" },
  { name: "Blood", foreground: "#ff1a1a", background: "#0a0000" },
] as const;

export type SectionId = "adjustments" | "characterSet" | "appearance";
