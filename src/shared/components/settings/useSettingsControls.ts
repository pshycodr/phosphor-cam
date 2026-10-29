import { useContext } from "react";

import { SettingsControlsContext } from "./SettingsControls";

export function useSettingsControls() {
  const controls = useContext(SettingsControlsContext);
  if (!controls) {
    throw new Error(
      "useSettingsControls must be used inside SettingsControlsProvider"
    );
  }
  return controls;
}
