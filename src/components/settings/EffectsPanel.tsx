import { type ChangeEvent, memo, useCallback } from "react";

import { useSettingsStore } from "@/store/settingsStore";
import type { EffectKey } from "@/types";

import ToggleRow from "./ToggleRow";

interface EffectConfig {
  key: EffectKey;
  label: string;
  description: string;
}

interface EffectGroup {
  label: string;
  items: EffectConfig[];
}

const EFFECT_GROUPS: EffectGroup[] = [
  {
    label: "Light",
    items: [
      {
        key: "glow",
        label: "Glow",
        description: "Soft ambient lift across the whole frame.",
      },
      {
        key: "bloom",
        label: "Bloom",
        description: "Wider glow that favors the brightest areas.",
      },
      {
        key: "halation",
        label: "Halation",
        description: "Warm halo around highlights, like film.",
      },
    ],
  },
  {
    label: "Lens",
    items: [
      {
        key: "chromaticAberration",
        label: "Chromatic Aberration",
        description: "Splits color channels apart for a glitchy fringe.",
      },
      {
        key: "vignette",
        label: "Vignette",
        description: "Darkens the corners.",
      },
    ],
  },
  {
    label: "Texture",
    items: [
      {
        key: "scanlines",
        label: "Scanlines",
        description: "Repeating dark lines, like a CRT screen.",
      },
      {
        key: "grain",
        label: "Grain",
        description: "Flickering film-style noise.",
      },
    ],
  },
];

interface EffectRowProps {
  effectKey: EffectKey;
  label: string;
  description: string;
}

const EffectRow = ({ effectKey, label, description }: EffectRowProps) => {
  const enabled = useSettingsStore(
    (s) => s.settings.effects[effectKey].enabled
  );
  const intensity = useSettingsStore(
    (s) => s.settings.effects[effectKey].intensity
  );
  const updateEffect = useSettingsStore((s) => s.updateEffect);

  const toggle = useCallback(
    () => updateEffect(effectKey, { enabled: !enabled }),
    [updateEffect, effectKey, enabled]
  );

  const onIntensityChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      updateEffect(effectKey, { intensity: Number(e.target.value) }),
    [updateEffect, effectKey]
  );

  return (
    <div className="py-2">
      <ToggleRow
        label={label}
        description={description}
        checked={enabled}
        onChange={toggle}
      />

      {enabled && (
        <div className="mt-2 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={intensity}
            onChange={onIntensityChange}
            aria-label={`${label} intensity`}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-green-500/20 accent-green-500 outline-none focus-visible:ring-2 focus-visible:ring-green-400/70"
          />
          <span className="w-9 shrink-0 text-right text-[11px] text-gray-400 tabular-nums">
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
        <h4 className="mb-1 text-[10px] font-semibold tracking-wide text-green-500/50 uppercase">
          {group.label}
        </h4>
        <div className="divide-y divide-green-500/10">
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
