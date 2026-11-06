import type { RenderMode } from "@/shared/types";

export const SLIDER_CONFIGS = {
  fontSize: { min: 2, max: 30, step: 1, label: "Character size" },
  contrast: { min: 0.5, max: 3.0, step: 0.1, label: "Contrast" },
  brightness: { min: -100, max: 100, step: 1, label: "Brightness" },
} as const;

export const RENDER_MODES = [
  { key: "ascii", label: "ASCII" },
  { key: "dither", label: "DITHER" },
  { key: "halftone", label: "HALFTONE" },
  { key: "voxel", label: "VOXEL" },
  { key: "lines", label: "LINES" },
] satisfies { key: RenderMode; label: string }[];
