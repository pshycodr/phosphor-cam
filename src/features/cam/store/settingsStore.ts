import { create } from "zustand";

import { createDefaultSettings } from "@/shared/constants/defaultSettings";
import type { AsciiSettings, EffectKey, EffectProps } from "@/shared/types";

interface SettingsStore {
  settings: AsciiSettings;
  updateSettings: (patch: Partial<AsciiSettings>) => void;
  /** Patches a single effect's props without the caller needing to spread
   *  the rest of settings.effects itself. */
  updateEffect: (key: EffectKey, patch: Partial<EffectProps>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: createDefaultSettings(),

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
