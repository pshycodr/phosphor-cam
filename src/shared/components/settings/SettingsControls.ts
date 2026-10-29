import { createContext } from "react";

import type { AsciiSettings, EffectKey, EffectProps } from "@/shared/types";

export interface SettingsUpdateOptions {
  /** Studio uses this to keep live slider drags out of undo history. */
  history?: boolean;
}

export interface SettingsControlsValue {
  settings: AsciiSettings;
  updateSettings: (
    patch: Partial<AsciiSettings>,
    options?: SettingsUpdateOptions
  ) => void;
  updateEffect: (
    key: EffectKey,
    patch: Partial<EffectProps>,
    options?: SettingsUpdateOptions
  ) => void;
}

export const SettingsControlsContext =
  createContext<SettingsControlsValue | null>(null);
