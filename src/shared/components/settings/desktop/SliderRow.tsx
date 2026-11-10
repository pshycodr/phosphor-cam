import { memo, useId } from "react";

import { SLIDER_CONFIGS } from "@/shared/constants/settings";
import type { AsciiSettings } from "@/shared/types";

import {
  useSettingsActions,
  useSettingsSelector,
} from "../common/useSettingsControls";

export type SliderKey = keyof typeof SLIDER_CONFIGS;

const SLIDER_KEYS = Object.keys(SLIDER_CONFIGS) as SliderKey[];

const formatValue = (key: SliderKey, value: number) => {
  if (key === "contrast") return `${value.toFixed(1)}x`;
  if (key === "brightness") return `${value > 0 ? "+" : ""}${value}`;
  return `${value}px`;
};

const SliderRow = memo(function SliderRow({
  settingKey,
}: {
  settingKey: SliderKey;
}) {
  const id = useId();
  const value = useSettingsSelector(
    (settings) => settings[settingKey] as number
  );
  const { updateSettings, commitHistory } = useSettingsActions();

  const config = SLIDER_CONFIGS[settingKey];
  const text = formatValue(settingKey, value);
  const commit = () => commitHistory?.();

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs font-medium">
        <label htmlFor={id} className="text-green-300">
          {config.label}
        </label>
        <output htmlFor={id} className="font-mono text-green-400 tabular-nums">
          {text}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        aria-valuetext={text}
        onChange={(e) =>
          updateSettings(
            {
              [settingKey]: +e.target.value,
            } as Partial<AsciiSettings>,
            { history: false }
          )
        }
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
        className="settings-slider w-full"
      />
    </div>
  );
});

const AdjustmentsContent = memo(function AdjustmentsContent() {
  return (
    <>
      {SLIDER_KEYS.map((key) => (
        <SliderRow key={key} settingKey={key} />
      ))}
    </>
  );
});

export default AdjustmentsContent;
