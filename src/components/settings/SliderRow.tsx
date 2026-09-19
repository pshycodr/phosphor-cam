import { memo } from "react";

import { useSettingsStore } from "@/store/settingsStore";
import type { AsciiSettings } from "@/types";

import { SLIDER_CONFIGS } from "./contants";

export type SliderKey = keyof typeof SLIDER_CONFIGS;

const formatValue = (key: SliderKey, value: number) => {
  if (key === "contrast") return `${value.toFixed(1)}x`;
  if (key === "brightness") return `${value > 0 ? "+" : ""}${value}`;
  return `${value}px`;
};

const SliderRow = ({ settingKey }: { settingKey: SliderKey }) => {
  const value = useSettingsStore((s) => s.settings[settingKey] as number);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const config = SLIDER_CONFIGS[settingKey];

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-medium text-green-300">
        <span>{config.label}</span>
        <span className="text-green-400">{formatValue(settingKey, value)}</span>
      </div>
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={(e) =>
          updateSettings({
            [settingKey]: +e.target.value,
          } as Partial<AsciiSettings>)
        }
        className="settings-slider"
      />
    </div>
  );
};

const AdjustmentsContent = memo(function AdjustmentsContent() {
  return (
    <>
      {(Object.keys(SLIDER_CONFIGS) as Array<keyof typeof SLIDER_CONFIGS>).map(
        (key) => (
          <SliderRow key={key} settingKey={key} />
        )
      )}
    </>
  );
});

export default memo(AdjustmentsContent);
