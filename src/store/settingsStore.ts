import { create } from "zustand";

import type {
  AsciiSettings,
  EffectKey,
  EffectProps,
  EffectsSettings,
} from "@/types";

const EFFECT_DEFAULTS: EffectsSettings = {
  glow: { enabled: false, intensity: 0.5 },
  bloom: { enabled: false, intensity: 0.6 },
  halation: { enabled: false, intensity: 0.5 },
  blur: { enabled: false, intensity: 0.4 },
  chromaticAberration: { enabled: false, intensity: 0.4 },
  vignette: { enabled: false, intensity: 0.5 },
  scanlines: { enabled: false, intensity: 0.5 },
  grain: { enabled: false, intensity: 0.4 },
};

const DEFAULT_SETTINGS: AsciiSettings = {
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
  effects: EFFECT_DEFAULTS,
  captureCodec: "png",
};

interface SettingsStore {
  settings: AsciiSettings;
  updateSettings: (patch: Partial<AsciiSettings>) => void;
  /** Patches a single effect's props without the caller needing to spread
   *  the rest of settings.effects itself. */
  updateEffect: (key: EffectKey, patch: Partial<EffectProps>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: DEFAULT_SETTINGS,

  updateSettings: (patch) =>
    set((state) => ({ settings: { ...state.settings, ...patch } })),

  updateEffect: (key, patch) =>
    set((state) => ({
      settings: {
        ...state.settings,
        effects: {
          ...state.settings.effects,
          [key]: { ...state.settings.effects[key], ...patch },
        },
      },
    })),
}));
