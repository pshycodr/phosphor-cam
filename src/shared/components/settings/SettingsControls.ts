import { createContext } from "react";

import type { AsciiSettings, EffectKey, EffectProps } from "@/shared/types";

export interface SettingsUpdateOptions {
  /** Studio uses this to keep live slider drags out of undo history. */
  history?: boolean;
}

export interface SettingsActions {
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

export interface SettingsControlsValue extends SettingsActions {
  /** Current snapshot, read on demand instead of subscribing to the whole tree. */
  getSettings: () => AsciiSettings;
  /** Subscribe to changes from the backing store. */
  subscribe: (listener: () => void) => () => void;
}

export const SettingsControlsContext =
  createContext<SettingsControlsValue | null>(null);
