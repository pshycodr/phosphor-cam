import { memo, useCallback, useState } from "react";
import { LuArrowLeftRight, LuDices } from "react-icons/lu";

import { COLOR_PRESETS } from "@/shared/constants/colorPresets";
import { Button } from "@/shared/ui/buttons";

import { randomPair, sameColor } from "../common/colorMath";
import ToggleRow from "../common/ToggleRow";
import {
  useSettingsActions,
  useSettingsSelector,
} from "../common/useSettingsControls";
import ColorSwitch from "./ColorSwitch";

type PickerKey = "foreground" | "background";

export const AppearanceMode = () => {
  const colorMode = useSettingsSelector((settings) => settings.colorMode);
  const invert = useSettingsSelector((settings) => settings.invert);
  const color = useSettingsSelector((settings) => settings.color);
  const { updateSettings, commitHistory } = useSettingsActions();

  const [activePicker, setActivePicker] = useState<PickerKey | null>(null);

  const togglePicker = useCallback(
    (key: PickerKey) => setActivePicker((cur) => (cur === key ? null : key)),
    []
  );

  const handleColorChange = useCallback(
    (key: PickerKey, value: string) => {
      updateSettings({ color: { ...color, [key]: value } }, { history: false });
    },
    [color, updateSettings]
  );

  const commitColor = useCallback(() => commitHistory?.(), [commitHistory]);

  const applyPreset = useCallback(
    (foreground: string, background: string) => {
      updateSettings({ color: { foreground, background } });
    },
    [updateSettings]
  );

  const swapColors = useCallback(() => {
    updateSettings({
      color: {
        foreground: color.background,
        background: color.foreground,
      },
    });
  }, [color, updateSettings]);

  const randomizeColors = useCallback(() => {
    updateSettings({ color: randomPair() });
  }, [updateSettings]);

  const toggleColorMode = useCallback(
    () => updateSettings({ colorMode: !colorMode }),
    [colorMode, updateSettings]
  );

  const toggleInvert = useCallback(
    () => updateSettings({ invert: !invert }),
    [invert, updateSettings]
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`text-[11px] text-muted ${colorMode ? "opacity-40" : ""}`}
          >
            Custom colors
          </span>

          {!colorMode && (
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={randomizeColors}
                title="Random foreground + background"
                className="h-8 px-2.5 text-[10px]"
              >
                <LuDices size={12} aria-hidden="true" />
                Random
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={swapColors}
                title="Swap foreground and background"
                className="h-8 px-2.5 text-[10px]"
              >
                <LuArrowLeftRight size={12} aria-hidden="true" />
                Swap
              </Button>
            </div>
          )}
        </div>

        {colorMode ? (
          <p className="mt-2 text-[11px] leading-relaxed text-faint">
            Turn off Color mode above to choose your own foreground and
            background.
          </p>
        ) : (
          <>
            <div className="mt-2 space-y-2">
              <ColorSwitch
                label="Foreground"
                value={color.foreground}
                open={activePicker === "foreground"}
                onToggle={() => togglePicker("foreground")}
                onChange={(v) => handleColorChange("foreground", v)}
                onCommit={commitColor}
              />
              <ColorSwitch
                label="Background"
                value={color.background}
                open={activePicker === "background"}
                onToggle={() => togglePicker("background")}
                onChange={(v) => handleColorChange("background", v)}
                onCommit={commitColor}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => {
                const active =
                  sameColor(preset.foreground, color.foreground) &&
                  sameColor(preset.background, color.background);
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      applyPreset(preset.foreground, preset.background)
                    }
                    title={preset.name}
                    aria-label={`${preset.name} color preset`}
                    aria-pressed={active}
                    className={`relative size-8 shrink-0 overflow-hidden rounded-full border transition-all hover:scale-105 ${
                      active
                        ? "border-signal ring-2 ring-signal/25"
                        : "border-line-strong"
                    }`}
                    style={{ backgroundColor: preset.background }}
                  >
                    <span
                      className="absolute inset-y-0 right-0 w-1/2"
                      style={{ backgroundColor: preset.foreground }}
                    />
                  </button>
                );
              })}
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
