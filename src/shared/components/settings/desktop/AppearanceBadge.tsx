import { memo } from "react";

import { useSettingsSelector } from "../common/useSettingsControls";

const AppearanceBadge = () => {
  const colorMode = useSettingsSelector((settings) => settings.colorMode);
  const color = useSettingsSelector((settings) => settings.color);

  if (colorMode) return <>Live color</>;

  return (
    <span
      className="flex items-center gap-1"
      role="img"
      aria-label={`Foreground ${color.foreground}, background ${color.background}`}
    >
      <span
        className="size-3 rounded-full border border-line-strong"
        style={{ backgroundColor: color.foreground }}
      />
      <span
        className="size-3 rounded-full border border-line-strong"
        style={{ backgroundColor: color.background }}
      />
    </span>
  );
};

export default memo(AppearanceBadge);
