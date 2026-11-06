import type { AsciiSettings, EffectsSettings } from "@/shared/types";

const createDefaultEffects = (): EffectsSettings => ({
  glow: { enabled: false, intensity: 0.5 },
  bloom: { enabled: false, intensity: 0.6 },
  halation: { enabled: false, intensity: 0.5 },
  chromaticAberration: { enabled: false, intensity: 0.4 },
  vignette: { enabled: false, intensity: 0.5 },
  scanlines: { enabled: false, intensity: 0.5 },
  grain: { enabled: false, intensity: 0.4 },
});

export const createDefaultSettings = (): AsciiSettings => ({
  resolution: 0.2,
  fontSize: 10,
  contrast: 1.2,
  brightness: 0,
  colorMode: false,
  invert: false,
  characterSet: "standard",
  renderMode: "ascii",
  color: {
    foreground: "#00ff00",
    background: "#000000",
  },
  voxel3d: true,
  captureScale: 4,
  lineDirection: "horizontal",
  effects: createDefaultEffects(),
  captureCodec: "png",
});
