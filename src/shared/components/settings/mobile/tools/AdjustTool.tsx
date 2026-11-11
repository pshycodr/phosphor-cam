import { memo, useState } from "react";
import type { IconType } from "react-icons";
import { LuContrast, LuSun, LuType } from "react-icons/lu";

import { SLIDER_CONFIGS } from "@/shared/constants/settings";
import type { AsciiSettings } from "@/shared/types";

import { SliderField } from "../../common/EditorSlider";
import {
  useSettingsActions,
  useSettingsSelector,
} from "../../common/useSettingsControls";
import { Chip, ScrollRow } from "../primitives";

type SliderKey = keyof typeof SLIDER_CONFIGS;

const KEYS = Object.keys(SLIDER_CONFIGS) as SliderKey[];

const CHIP_LABELS: Record<SliderKey, string> = {
  fontSize: "Size",
  contrast: "Contrast",
  brightness: "Brightness",
};

const ICONS: Record<SliderKey, IconType> = {
  fontSize: LuType,
  contrast: LuContrast,
  brightness: LuSun,
};

const formatValue = (key: SliderKey, value: number) => {
  if (key === "contrast") return `${value.toFixed(1)}x`;
  if (key === "brightness") return `${value > 0 ? "+" : ""}${value}`;
  return `${value}px`;
};

const AdjustChip = memo(function AdjustChip({
  settingKey,
  active,
  onSelect,
}: {
  settingKey: SliderKey;
  active: boolean;
  onSelect: (key: SliderKey) => void;
}) {
  const value = useSettingsSelector((s) => s[settingKey] as number);
  const Icon = ICONS[settingKey];
  return (
    <Chip active={active} pressed={active} onClick={() => onSelect(settingKey)}>
      <Icon size={15} aria-hidden="true" />
      {CHIP_LABELS[settingKey]}
      <span className={active ? "opacity-70" : "text-green-500/70"}>
        {formatValue(settingKey, value)}
      </span>
    </Chip>
  );
});

const AdjustSlider = memo(function AdjustSlider({
  settingKey,
}: {
  settingKey: SliderKey;
}) {
  const value = useSettingsSelector((s) => s[settingKey] as number);
  const { updateSettings, commitHistory } = useSettingsActions();
  const config = SLIDER_CONFIGS[settingKey];
  const text = formatValue(settingKey, value);

  return (
    <SliderField
      label={config.label}
      display={text}
      valueText={text}
      min={config.min}
      max={config.max}
      step={config.step}
      value={value}
      bipolar={config.min < 0 && config.max > 0}
      onChange={(v) =>
        updateSettings({ [settingKey]: v } as Partial<AsciiSettings>, {
          history: false,
        })
      }
      onCommit={() => commitHistory?.()}
    />
  );
});

const AdjustTool = () => {
  const [selected, setSelected] = useState<SliderKey>(KEYS[0]);

  return (
    <div className="space-y-2">
      <ScrollRow>
        {KEYS.map((key) => (
          <AdjustChip
            key={key}
            settingKey={key}
            active={key === selected}
            onSelect={setSelected}
          />
        ))}
      </ScrollRow>
      <AdjustSlider key={selected} settingKey={selected} />
    </div>
  );
};

export default memo(AdjustTool);
