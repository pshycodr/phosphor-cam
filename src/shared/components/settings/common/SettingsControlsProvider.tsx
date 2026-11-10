import { type ReactNode } from "react";

import {
  SettingsControlsContext,
  type SettingsControlsValue,
} from "./SettingsControls";

export function SettingsControlsProvider({
  value,
  children,
}: {
  value: SettingsControlsValue;
  children: ReactNode;
}) {
  return (
    <SettingsControlsContext.Provider value={value}>
      {children}
    </SettingsControlsContext.Provider>
  );
}
