import { memo, useCallback, useState } from "react";
import { LuArrowLeftRight, LuDices } from "react-icons/lu";

import { COLOR_PRESETS } from "@/constants/settings";
import { useSettingsStore } from "@/store/settingsStore";

import ColorSwitch from "./ColorSwitch";
import ToggleRow from "./ToggleRow";

/* ----------------------------- random colors ---------------------------- */

/** Returns a vivid random hex color (HSV with s,v in a mid-high range). */
function randomHex(): string {
  const h = Math.random() * 360;
  const s = 0.55 + Math.random() * 0.45;
  const v = 0.55 + Math.random() * 0.45;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r, g, b;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const to = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Relative luminance of a hex color (0..1), for contrast checks. */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16);
  const r = ((n >> 16) & 0xff) / 255;
  const g = ((n >> 8) & 0xff) / 255;
  const b = (n & 0xff) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function randomPair(): { foreground: string; background: string } {
  const MIN_GAP = 0.35;
  for (let attempt = 0; attempt < 20; attempt++) {
    const fg = randomHex();
    const bg = randomHex();
    if (Math.abs(luminance(fg) - luminance(bg)) >= MIN_GAP) {
      return { foreground: fg, background: bg };
    }
  }
  // Fallback: pair a dark background with a bright foreground
  const dark = randomHex();
  return { foreground: "#f5f5f5", background: dark };
}

const sameColor = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

const SMALL_ACTION =
  "flex h-8 items-center gap-1.5 rounded-md border border-green-500/40 px-2.5 text-xs font-medium text-green-400 outline-none transition-colors hover:bg-green-900/20 focus-visible:ring-2 focus-visible:ring-green-400/70";

type PickerKey = "foreground" | "background";

/* ------------------------------- component ------------------------------ */

export const AppearanceMode = () => {
  const colorMode = useSettingsStore((s) => s.settings.colorMode);
  const invert = useSettingsStore((s) => s.settings.invert);
  const color = useSettingsStore((s) => s.settings.color);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [activePicker, setActivePicker] = useState<PickerKey | null>(null);

  const togglePicker = useCallback(
    (key: PickerKey) => setActivePicker((cur) => (cur === key ? null : key)),
    []
  );

  const handleColorChange = useCallback(
    (key: PickerKey, value: string) => {
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

  const randomizeColors = useCallback(() => {
    updateSettings({ color: randomPair() });
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`text-xs font-medium text-green-400 ${
              colorMode ? "opacity-40" : ""
            }`}
          >
            Custom colors
          </span>

          {!colorMode && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={randomizeColors}
                className={SMALL_ACTION}
                title="Random foreground + background"
              >
                <LuDices size={13} aria-hidden="true" />
                Random
              </button>

              <button
                type="button"
                onClick={swapColors}
                className={SMALL_ACTION}
                title="Swap foreground and background"
              >
                <LuArrowLeftRight size={13} aria-hidden="true" />
                Swap
              </button>
            </div>
          )}
        </div>

        {colorMode ? (
          <p className="mt-2 text-xs leading-relaxed text-green-500/70">
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
              />
              <ColorSwitch
                label="Background"
                value={color.background}
                open={activePicker === "background"}
                onToggle={() => togglePicker("background")}
                onChange={(v) => handleColorChange("background", v)}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2.5">
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
                    className={`relative size-9 shrink-0 overflow-hidden rounded-full border-2 transition-all outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-green-400/70 ${
                      active
                        ? "border-green-400 ring-2 ring-green-400/40"
                        : "border-green-500/30 hover:border-green-400"
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
