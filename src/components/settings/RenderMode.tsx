import { memo } from "react";

import { useSettingsStore } from "@/store/settingsStore";

import { RENDER_MODES } from "./contants";

const RenderMode = () => {
  const renderMode = useSettingsStore((s) => s.settings.renderMode);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <section className="border-b border-green-500/15 py-5">
      <p className="mb-3 text-xs font-semibold text-green-400">Render engine</p>
      <div className="flex flex-wrap gap-2">
        {RENDER_MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => updateSettings({ renderMode: key })}
            className={`rounded-full border px-4 py-2 text-xs font-bold tracking-wide ${
              renderMode === key
                ? "border-green-400 bg-green-600 text-black"
                : "border-green-500/50 text-green-400 hover:bg-green-900/20"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default memo(RenderMode);
