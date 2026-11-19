import { type ChangeEvent, memo, useCallback } from "react";

import type { EffectKey } from "@/shared/types";
import { Range } from "@/shared/ui/controls";

import { EFFECT_GROUPS } from "./effectGroups";
import ToggleRow from "./ToggleRow";
import { useSettingsActions, useSettingsSelector } from "./useSettingsControls";

interface EffectRowProps {
  effectKey: EffectKey;
  label: string;
  description: string;
}

const EffectRow = ({ effectKey, label, description }: EffectRowProps) => {
  const enabled = useSettingsSelector(
    (settings) => settings.effects[effectKey].enabled
  );
  const intensity = useSettingsSelector(
    (settings) => settings.effects[effectKey].intensity
  );
  const { updateEffect, commitHistory } = useSettingsActions();

  const toggle = useCallback(
    () => updateEffect(effectKey, { enabled: !enabled }),
    [updateEffect, effectKey, enabled]
  );

  const onIntensityChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      updateEffect(
        effectKey,
        { intensity: Number(e.target.value) },
        { history: false }
      ),
    [updateEffect, effectKey]
  );

  const commit = useCallback(() => commitHistory?.(), [commitHistory]);

  return (
    <div className="py-2">
      <ToggleRow
        label={label}
        description={description}
        checked={enabled}
        onChange={toggle}
      />

      {enabled && (
        <div className="mt-1 flex items-center gap-3">
          <Range
            min={0}
            max={1}
            step={0.05}
            value={intensity}
            onChange={onIntensityChange}
            onPointerUp={commit}
            onKeyUp={commit}
            onBlur={commit}
            aria-label={`${label} intensity`}
          />
          <span className="w-8 shrink-0 text-right font-mono text-[10px] text-faint tabular-nums">
            {Math.round(intensity * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};

const EffectsPanel = () => (
  <div role="group" aria-label="Post effects" className="space-y-4">
    {EFFECT_GROUPS.map((group) => (
      <div key={group.label}>
        <h4 className="mb-1 font-mono text-[9px] tracking-[0.16em] text-faint uppercase">
          {group.label}
        </h4>
        <div className="divide-y divide-line/60">
          {group.items.map(({ key, label, description }) => (
            <EffectRow
              key={key}
              effectKey={key}
              label={label}
              description={description}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default memo(EffectsPanel);
