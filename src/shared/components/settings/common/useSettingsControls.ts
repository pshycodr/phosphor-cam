import { useCallback, useContext, useRef, useSyncExternalStore } from "react";

import type { AsciiSettings } from "@/shared/types";

import {
  type SettingsActions,
  SettingsControlsContext,
  type SettingsControlsValue,
} from "./SettingsControls";

export function useSettingsControls(): SettingsControlsValue {
  const controls = useContext(SettingsControlsContext);
  if (!controls) {
    throw new Error(
      "useSettingsControls must be used inside SettingsControlsProvider"
    );
  }
  return controls;
}

/** Stable actions only; consuming this does not subscribe to settings updates. */
export function useSettingsActions(): SettingsActions {
  const { updateSettings, updateEffect, commitHistory } = useSettingsControls();
  return { updateSettings, updateEffect, commitHistory };
}

/** Subscribe to a single slice of the settings object. Only the component
 *  using this hook re-renders when that slice changes. */
export function useSettingsSelector<T>(
  selector: (settings: AsciiSettings) => T,
  isEqual: (current: T, next: T) => boolean = Object.is
): T {
  const controls = useSettingsControls();

  const cacheRef = useRef<{
    settings: AsciiSettings;
    selector: (settings: AsciiSettings) => T;
    value: T;
  } | null>(null);

  const getSnapshot = useCallback(() => {
    const settings = controls.getSettings();
    const cache = cacheRef.current;

    if (cache && cache.settings === settings && cache.selector === selector) {
      return cache.value;
    }

    const next = selector(settings);
    if (cache && isEqual(cache.value, next)) {
      cache.settings = settings;
      cache.selector = selector;
      return cache.value;
    }

    cacheRef.current = { settings, selector, value: next };
    return next;
  }, [controls, isEqual, selector]);

  return useSyncExternalStore(controls.subscribe, getSnapshot, getSnapshot);
}
