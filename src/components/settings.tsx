import { memo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { LuSettings2 } from "react-icons/lu";

import { CHAR_SETS, CHARACTER_SETS } from "@/constants/characterSets";
import { useSettingsStore } from "@/store/settingsStore";
import type { AsciiSettings } from "@/types";

const SLIDER_CONFIGS = {
  fontSize: { min: 2, max: 30, step: 1, label: "RESOLUTION" },
  contrast: { min: 0.5, max: 3.0, step: 0.1, label: "CONTRAST" },
  brightness: { min: -100, max: 100, step: 1, label: "BRIGHTNESS" },
} as const;

const RENDER_MODES = [{ key: "ascii", label: "ASCII" }] as const;

function Settings() {
  const [isOpen, setIsOpen] = useState(false);

  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const handleChange = (
    key: keyof AsciiSettings,
    value: number | string | boolean
  ) => {
    updateSettings({ [key]: value } as Partial<AsciiSettings>);
  };

  const formatValue = (key: keyof typeof SLIDER_CONFIGS, value: number) => {
    if (key === "contrast") return value.toFixed(1);
    if (key === "brightness") return `${value > 0 ? "+" : ""}${value}`;
    return `${value}px`;
  };

  return (
    <>
      {!isOpen && (
        <button
          className="fixed top-4 right-4 z-50 rounded-lg border border-green-500/30 bg-black/40 p-3 text-green-400 shadow-lg backdrop-blur-sm hover:border-green-400 hover:bg-green-900/30"
          onClick={() => setIsOpen(true)}
        >
          <LuSettings2 size={24} />
        </button>
      )}

      {isOpen && (
        <aside className="fixed inset-0 z-40 flex h-full w-full flex-col bg-black shadow-2xl sm:right-0 sm:left-auto sm:w-96">
          <header className="flex items-center justify-between border-b border-green-600 px-5 py-6">
            <h2 className="text-xl font-bold tracking-wide text-green-400">
              SETTINGS
            </h2>
            <button
              className="rounded-lg p-2 text-green-400 hover:bg-green-900/30"
              onClick={() => setIsOpen(false)}
            >
              <IoClose size={24} />
            </button>
          </header>

          <div className="flex-1 space-y-8 overflow-y-auto p-5 pb-24 text-sm text-gray-200">
            <section>
              <p className="mb-3 text-xs font-semibold text-green-400 uppercase">
                Render Engine
              </p>
              <div className="flex flex-wrap gap-2">
                {RENDER_MODES.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleChange("renderMode", key)}
                    className={`flex-1 rounded-lg border px-3 py-3 text-xs font-bold tracking-wider ${
                      settings.renderMode === key
                        ? "border-green-400 bg-green-600 text-black"
                        : "border-green-500 text-green-400 hover:bg-green-900/20"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>

            {(
              Object.keys(SLIDER_CONFIGS) as Array<keyof typeof SLIDER_CONFIGS>
            ).map((key) => {
              const config = SLIDER_CONFIGS[key];
              return (
                <section key={key}>
                  <div className="mb-2 flex justify-between text-xs font-semibold text-green-400">
                    <span>{config.label}</span>
                    <span className="text-green-300">
                      {formatValue(key, settings[key])}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={settings[key]}
                    onChange={(e) => handleChange(key, +e.target.value)}
                    className="settings-slider"
                  />
                </section>
              );
            })}

            {settings.renderMode === "ascii" && (
              <section>
                <p className="mb-3 text-xs font-semibold text-green-400 uppercase">
                  Character Set
                </p>
                <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3">
                  {CHARACTER_SETS.map((set) => (
                    <button
                      key={set}
                      onClick={() => handleChange("characterSet", set)}
                      className={`min-w-27.5 shrink-0 snap-start rounded-lg border px-3 py-3 text-left ${
                        settings.characterSet === set
                          ? "border-green-400 bg-green-600 text-black"
                          : "border-green-500 text-green-400 hover:bg-green-900/20"
                      }`}
                    >
                      <div className="mb-1 text-[11px] font-semibold uppercase">
                        {set}
                      </div>
                      <div className="truncate font-mono text-[11px] leading-tight opacity-80">
                        {CHAR_SETS[set].slice(0, 14)}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-3 rounded-md border border-green-500 bg-black/40 p-3">
                  <div className="mb-1 text-[10px] text-green-500 uppercase">
                    Preview
                  </div>
                  <div className="font-mono text-xs leading-tight wrap-break-word whitespace-pre-wrap text-green-300">
                    {CHAR_SETS[settings.characterSet]}
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-4 pt-2">
              <label className="flex cursor-pointer items-center justify-between py-3 text-green-400">
                <span className="text-sm font-medium">Color Mode</span>
                <input
                  type="checkbox"
                  checked={settings.colorMode}
                  onChange={() =>
                    handleChange("colorMode", !settings.colorMode)
                  }
                  className="settings-toggle"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between py-3 text-green-400">
                <span className="text-sm font-medium">Invert Values</span>
                <input
                  type="checkbox"
                  checked={settings.invert}
                  onChange={() => handleChange("invert", !settings.invert)}
                  className="settings-toggle"
                />
              </label>
            </section>
          </div>
        </aside>
      )}
    </>
  );
}

export default memo(Settings);
