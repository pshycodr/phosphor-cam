import type { ColorPreset } from "@/shared/types";

export const COLOR_PRESETS = [
  { name: "Matrix", foreground: "#00ff00", background: "#000000" },
  { name: "Amber", foreground: "#ffb000", background: "#000000" },
  { name: "Cyan", foreground: "#00e5ff", background: "#000000" },
  { name: "Paper", foreground: "#1a1a1a", background: "#f5f5f0" },
  { name: "Neon Pink", foreground: "#ff2e88", background: "#0a0014" },
  { name: "Blood", foreground: "#ff1a1a", background: "#0a0000" },
] as const satisfies readonly ColorPreset[];
