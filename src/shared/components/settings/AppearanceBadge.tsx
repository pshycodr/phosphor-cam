import { memo } from "react";

import { useSettingsControls } from "./useSettingsControls";

const AppearanceBadge = () => {
  const { settings } = useSettingsControls();
  const { colorMode, color } = settings;

  if (colorMode) return <>Live camera color</>;

  return (
    <span
      className="flex items-center gap-1"
      role="img"
      aria-label={`Foreground ${color.foreground}, background ${color.background}`}
    >
      <span
        className="size-3.5 rounded-full border border-green-500/40"
        style={{ backgroundColor: color.foreground }}
      />
      <span
        className="size-3.5 rounded-full border border-green-500/40"
        style={{ backgroundColor: color.background }}
      />
    </span>
  );
};

export default memo(AppearanceBadge);
