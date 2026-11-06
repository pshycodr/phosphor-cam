import { memo, useMemo } from "react";

import { Check } from "lucide-react";

import { useSettingsSelector } from "@/shared/components/settings/useSettingsControls";

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
    <div className="flex flex-col gap-5 text-xs">
      {categories.map(([category, presets]) => (
        <div key={category} className="flex flex-col gap-2">
          <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
            {category}
          </span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
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
                  className={`group flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition-all focus-visible:ring-2 focus-visible:ring-green-400/80 focus-visible:outline-none ${
                    isMatch
                      ? "border-green-500/60 bg-green-950/30 text-white shadow-sm"
                      : "border-zinc-800/80 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-white"
                  }`}
                >
                  {/* Preset swatch */}
                  <span
                    className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: preset.accentColor }}
                  >
                    {isMatch && (
                      <Check
                        size={10}
                        strokeWidth={3}
                        className={
                          preset.accentColor === "#f5f5f0" ||
                          preset.accentColor === "#ffea00"
                            ? "text-black"
                            : "text-white"
                        }
                      />
                    )}
                  </span>

                  <div className="flex flex-1 flex-col overflow-hidden leading-tight">
                    <span className="font-bold text-white group-hover:text-green-400">
                      {preset.name}
                    </span>
                    <span className="line-clamp-1 text-[10px] text-zinc-400">
                      {preset.description}
                    </span>
                  </div>
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
