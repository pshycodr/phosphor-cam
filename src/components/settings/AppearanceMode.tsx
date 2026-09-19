import { memo, useCallback } from "react";
import { LuArrowLeftRight } from "react-icons/lu";

import { useSettingsStore } from "@/store/settingsStore";

import ColorSwitch from "./ColorSwitch";
import { COLOR_PRESETS } from "./contants";
import ToggleRow from "./ToggleRow";

export const AppearanceMode = () => {
  const colorMode = useSettingsStore((s) => s.settings.colorMode);
  const invert = useSettingsStore((s) => s.settings.invert);
  const color = useSettingsStore((s) => s.settings.color);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const handleColorChange = useCallback(
    (key: "foreground" | "background", value: string) => {
      updateSettings({
        color: { ...useSettingsStore.getState().settings.color, [key]: value },
      });
    },
    [updateSettings]
  );

  const applyPreset = useCallback(
    (foreground: string, background: string) => {
      updateSettings({ color: { foreground, background } });
    },
    [updateSettings]
  );

  const swapColors = useCallback(() => {
    const current = useSettingsStore.getState().settings.color;
    updateSettings({
      color: {
        foreground: current.background,
        background: current.foreground,
      },
    });
  }, [updateSettings]);

  const toggleColorMode = useCallback(
    () =>
      updateSettings({
        colorMode: !useSettingsStore.getState().settings.colorMode,
      }),
    [updateSettings]
  );

  const toggleInvert = useCallback(
    () =>
      updateSettings({
        invert: !useSettingsStore.getState().settings.invert,
      }),
    [updateSettings]
  );

  return (
    <>
      <ToggleRow
        label="Color mode"
        description="Draw each character in the camera's real color instead of a fixed palette."
        checked={colorMode}
        onChange={toggleColorMode}
      />

      <div>
        <div
          className={`flex items-center justify-between ${colorMode ? "opacity-40" : ""}`}
        >
          <span className="text-xs font-medium text-green-400">
            Custom colors
          </span>
          <button
            onClick={swapColors}
            disabled={colorMode}
            className="flex items-center gap-1 rounded-md border border-green-500/40 px-2 py-1 text-[10px] font-medium text-green-400 hover:bg-green-900/20 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <LuArrowLeftRight size={11} />
            Swap
          </button>
        </div>

        {colorMode ? (
          <p className="mt-2 text-xs leading-relaxed text-green-500/60">
            Turn off Color Mode above to set a custom foreground and background.
          </p>
        ) : (
          <>
            <div className="mt-2 space-y-2">
              <ColorSwitch
                label="Foreground"
                value={color.foreground}
                onChange={(v) => handleColorChange("foreground", v)}
              />
              <ColorSwitch
                label="Background"
                value={color.background}
                onChange={(v) => handleColorChange("background", v)}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() =>
                    applyPreset(preset.foreground, preset.background)
                  }
                  title={preset.name}
                  className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-green-500/30 transition-transform hover:scale-110 hover:border-green-400"
                  style={{ backgroundColor: preset.background }}
                  aria-label={`Apply ${preset.name} color preset`}
                >
                  <span
                    className="absolute inset-y-0 right-0 w-1/2"
                    style={{ backgroundColor: preset.foreground }}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <ToggleRow
        label="Invert values"
        description="Swap which characters represent light and dark areas."
        checked={invert}
        onChange={toggleInvert}
      />
    </>
  );
};

export default memo(AppearanceMode);
