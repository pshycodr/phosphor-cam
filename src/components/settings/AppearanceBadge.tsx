import { memo } from "react";

import { useSettingsStore } from "@/store/settingsStore";

const AppearanceBadge = () => {
  const colorMode = useSettingsStore((s) => s.settings.colorMode);
  const color = useSettingsStore((s) => s.settings.color);

  if (colorMode) return <>Live camera color</>;

  return (
    <span className="flex items-center gap-1">
      <span
        className="h-3 w-3 rounded-full border border-green-500/40"
        style={{ backgroundColor: color.foreground }}
      />
      <span
        className="h-3 w-3 rounded-full border border-green-500/40"
        style={{ backgroundColor: color.background }}
      />
    </span>
  );
};

export default memo(AppearanceBadge);
