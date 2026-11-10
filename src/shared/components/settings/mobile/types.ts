import type { ReactNode } from "react";

/** One tab in the mobile editor dock. */
export interface EditorTool {
  id: string;
  label: string;
  /** Tab icon (about 22px). */
  icon: ReactNode;
  /** Optional small marker drawn on the tab icon, e.g. an "n active" count. */
  badge?: ReactNode;
  /** Rendered inside the panel above the tab bar while this tool is selected. */
  content: ReactNode;
  /** Set to false to hide the tab. */
  visible?: boolean;
}

/** CSS variable the dock keeps in sync with its own height (px). */
export const DOCK_HEIGHT_VAR = "--editor-dock-h";
