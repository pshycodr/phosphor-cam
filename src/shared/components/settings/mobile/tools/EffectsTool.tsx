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
        className={`size-2 rounded-full ${
          enabled
            ? active
              ? "bg-black"
              : "bg-green-400 shadow-[0_0_6px_#4ade80]"
            : active
              ? "bg-black/30"
              : "bg-green-500/25"
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
          <p className="text-sm font-semibold text-green-300">{config.label}</p>
          <p className="text-xs leading-snug text-green-500/70">
            {config.description}
          </p>
        </div>
        <Switch
          checked={enabled}
          onChange={() => updateEffect(effectKey, { enabled: !enabled })}
          label={`${config.label} on or off`}
        />
      </div>

      <div className={enabled ? "" : "opacity-60"}>
        <SliderField
          label="Intensity"
          display={percent}
          valueText={percent}
          min={0}
          max={1}
          step={0.05}
          value={intensity}
          // Dragging a dimmed slider switches the effect on.
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

/** Count of active effects, drawn on the tab icon. */
export const EffectsTabBadge = memo(function EffectsTabBadge() {
  const count = useSettingsSelector(
    (s) => Object.values(s.effects).filter((e) => e.enabled).length
  );
  if (count === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-500 px-1 text-[9px] leading-none font-bold text-black">
      {count}
    </span>
  );
});
