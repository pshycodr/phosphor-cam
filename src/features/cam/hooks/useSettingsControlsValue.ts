import { useMemo } from "react";

import type { SettingsControlsValue } from "@/shared/components/settings/common/SettingsControls";

import { useSettingsStore } from "../store/settingsStore";

/** Bridges the camera's settings store to the shared settings controls. */
export function useSettingsControlsValue(): SettingsControlsValue {
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const updateEffect = useSettingsStore((s) => s.updateEffect);

  return useMemo(
    () => ({
      getSettings: () => useSettingsStore.getState().settings,
      subscribe: (listener) => useSettingsStore.subscribe(listener),
      updateSettings,
      updateEffect,
    }),
    [updateSettings, updateEffect]
  );
}
