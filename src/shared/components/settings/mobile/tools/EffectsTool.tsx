import { memo, useState } from "react";

import type { EffectKey } from "@/shared/types";

import { SliderField } from "../../common/EditorSlider";
import { EFFECT_GROUPS } from "../../common/effectGroups";
import {
  useSettingsActions,
  useSettingsControls,
  useSettingsSelector,
} from "../../common/useSettingsControls";
import { Chip, ScrollRow, Switch } from "../primitives";

const ALL_EFFECTS = EFFECT_GROUPS.flatMap((g) => g.items);

const SHORT_LABELS: Partial<Record<EffectKey, string>> = {
  chromaticAberration: "Chromatic",
};

const EffectChip = memo(function EffectChip({
  effectKey,
  label,
  active,
  onSelect,
}: {
  effectKey: EffectKey;
  label: string;
  active: boolean;
  onSelect: (key: EffectKey) => void;
}) {
  const enabled = useSettingsSelector((s) => s.effects[effectKey].enabled);
  return (
    <Chip active={active} pressed={active} onClick={() => onSelect(effectKey)}>
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${
          enabled
            ? active
              ? "bg-signal"
              : "bg-signal/70"
            : active
              ? "bg-current opacity-30"
              : "bg-line-strong"
        }`}
      />
      {SHORT_LABELS[effectKey] ?? label}
      {enabled && <span className="sr-only">(on)</span>}
    </Chip>
  );
});

const EffectDetail = memo(function EffectDetail({
  effectKey,
}: {
  effectKey: EffectKey;
}) {
  const enabled = useSettingsSelector((s) => s.effects[effectKey].enabled);
  const intensity = useSettingsSelector((s) => s.effects[effectKey].intensity);
  const { updateEffect, commitHistory } = useSettingsActions();
  const config = ALL_EFFECTS.find((e) => e.key === effectKey)!;
  const percent = `${Math.round(intensity * 100)}%`;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-4 px-0.5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-paper">{config.label}</p>
          <p className="text-[11px] leading-snug text-faint">
            {config.description}
          </p>
        </div>
        <Switch
          checked={enabled}
          onChange={() => updateEffect(effectKey, { enabled: !enabled })}
          label={`${config.label} on or off`}
        />
      </div>

      <div className={enabled ? "" : "opacity-50"}>
        <SliderField
          label="Intensity"
          display={percent}
          valueText={percent}
          min={0}
          max={1}
          step={0.05}
          value={intensity}
          onChange={(v) =>
            updateEffect(
              effectKey,
              enabled ? { intensity: v } : { intensity: v, enabled: true },
              { history: false }
            )
          }
          onCommit={() => commitHistory?.()}
        />
      </div>
    </div>
  );
});

const EffectsTool = () => {
  const { getSettings } = useSettingsControls();
  const [selected, setSelected] = useState<EffectKey>(() => {
    const s = getSettings();
    return (
      ALL_EFFECTS.find((e) => s.effects[e.key].enabled)?.key ??
      ALL_EFFECTS[0].key
    );
  });

  return (
    <div className="space-y-3">
      <ScrollRow>
        {ALL_EFFECTS.map((e) => (
          <EffectChip
            key={e.key}
            effectKey={e.key}
            label={e.label}
            active={e.key === selected}
            onSelect={setSelected}
          />
        ))}
      </ScrollRow>
      <EffectDetail key={selected} effectKey={selected} />
    </div>
  );
};

export default memo(EffectsTool);

export const EffectsTabBadge = memo(function EffectsTabBadge() {
  const count = useSettingsSelector(
    (s) => Object.values(s.effects).filter((e) => e.enabled).length
  );
  if (count === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-2.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-signal px-1 font-mono text-[8px] leading-none text-ink">
      {count}
    </span>
  );
});
