import { memo } from "react";

import { useSettingsSelector } from "../common/useSettingsControls";

const AppearanceBadge = () => {
  const colorMode = useSettingsSelector((settings) => settings.colorMode);
  const color = useSettingsSelector((settings) => settings.color);

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
