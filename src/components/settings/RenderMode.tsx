import { memo } from "react";

import { useSettingsStore } from "@/store/settingsStore";

import { RENDER_MODES } from "./contants";

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
        className="grid auto-cols-fr grid-flow-col gap-1 rounded-full border border-green-500/30 bg-black/30 p-1"
      >
        {RENDER_MODES.map(({ key, label }) => {
          const active = renderMode === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => updateSettings({ renderMode: key })}
              aria-pressed={active}
              className={`min-h-10 rounded-full px-4 text-xs font-bold tracking-wide transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-400/70 ${
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
