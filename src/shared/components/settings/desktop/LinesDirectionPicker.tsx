import { memo } from "react";
import { LuColumns3, LuRows3 } from "react-icons/lu";

import { Segmented } from "@/shared/ui/controls";

import {
  useSettingsActions,
  useSettingsSelector,
} from "../common/useSettingsControls";

const OPTIONS = [
  {
    key: "horizontal" as const,
    label: (
      <span className="flex items-center gap-2">
        <LuRows3 size={15} aria-hidden="true" />
        Horizontal
      </span>
    ),
  },
  {
    key: "vertical" as const,
    label: (
      <span className="flex items-center gap-2">
        <LuColumns3 size={15} aria-hidden="true" />
        Vertical
      </span>
    ),
  },
];

const LinesDirectionPicker = () => {
  const lineDirection = useSettingsSelector(
    (settings) => settings.lineDirection
  );
  const { updateSettings } = useSettingsActions();

  return (
    <Segmented
      label="Line direction"
      options={OPTIONS}
      value={lineDirection}
      onChange={(lineDirection) => updateSettings({ lineDirection })}
    />
  );
};

export default memo(LinesDirectionPicker);
