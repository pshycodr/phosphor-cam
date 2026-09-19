import { create } from "zustand";

import type { AsciiSettings } from "@/types";

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
};

interface SettingsStore {
  settings: AsciiSettings;
  updateSettings: (patch: Partial<AsciiSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: DEFAULT_SETTINGS,
  updateSettings: (patch) =>
    set((state) => ({ settings: { ...state.settings, ...patch } })),
}));
