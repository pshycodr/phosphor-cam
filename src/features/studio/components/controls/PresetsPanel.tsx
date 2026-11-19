import { memo, useMemo } from "react";

import { Check } from "lucide-react";

import { useSettingsSelector } from "@/shared/components/settings/common/useSettingsControls";

import { STUDIO_PRESETS, type StudioPreset } from "../../constants/presets";
import { useStudioStore } from "../../store/studioStore";

function PresetsPanel() {
  const applyPreset = useStudioStore((s) => s.applyPreset);
  const renderMode = useSettingsSelector((settings) => settings.renderMode);
  const colorMode = useSettingsSelector((settings) => settings.colorMode);
  const foreground = useSettingsSelector(
    (settings) => settings.color.foreground
  );

  const categories = useMemo(() => {
    const map = new Map<string, StudioPreset[]>();
    for (const preset of STUDIO_PRESETS) {
      const list = map.get(preset.category) || [];
      list.push(preset);
      map.set(preset.category, list);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <div className="flex flex-col gap-5 pb-1">
      {categories.map(([category, presets]) => (
        <div key={category} className="flex flex-col gap-2">
          <span className="font-mono text-[9px] tracking-[0.18em] text-faint uppercase">
            {category}
          </span>

          <div className="grid grid-cols-2 gap-1.5">
            {presets.map((preset) => {
              const isMatch =
                renderMode === preset.settings.renderMode &&
                colorMode === preset.settings.colorMode &&
                (!preset.settings.color?.foreground ||
                  foreground === preset.settings.color.foreground);

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.settings)}
                  aria-pressed={isMatch}
                  className={`press group flex items-start gap-2 rounded-lg border p-2 text-left ${
                    isMatch
                      ? "border-signal/50 bg-signal/5"
                      : "border-line/80 bg-ink-3/40 hover:border-line-strong"
                  }`}
                >
                  <span
                    className="mt-0.5 size-3.5 shrink-0 rounded-full border border-line-strong"
                    style={{ backgroundColor: preset.accentColor }}
                  />

                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="flex items-center justify-between gap-1">
                      <span
                        className={`truncate text-[11px] font-medium ${
                          isMatch ? "text-signal" : "text-paper"
                        }`}
                      >
                        {preset.name}
                      </span>
                      {isMatch && (
                        <Check
                          size={11}
                          strokeWidth={2.5}
                          aria-hidden="true"
                          className="shrink-0 text-signal"
                        />
                      )}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-faint">
                      {preset.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(PresetsPanel);
