import { memo } from "react";

import { RENDER_MODES } from "@/constants/settings";
import { useSettingsStore } from "@/store/settingsStore";

const RenderMode = () => {
  const renderMode = useSettingsStore((s) => s.settings.renderMode);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <section className="border-b border-green-500/15 py-5">
      <h3 className="mb-3 text-xs font-semibold text-green-400">
        Render engine
      </h3>

      <div
        role="group"
        aria-label="Render engine"
        className="flex flex-wrap gap-1 rounded-2xl border border-green-500/30 bg-black/30 p-1"
      >
        {RENDER_MODES.map(({ key, label }) => {
          const active = renderMode === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => updateSettings({ renderMode: key })}
              aria-pressed={active}
              className={`min-h-10 grow basis-20 rounded-full px-3 text-xs font-bold tracking-wide whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-400/70 ${
                active
                  ? "bg-green-600 text-black"
                  : "text-green-400 hover:bg-green-900/30"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default memo(RenderMode);
