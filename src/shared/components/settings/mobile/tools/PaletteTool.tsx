import { memo, useCallback, useState } from "react";
import { LuArrowLeftRight, LuBlend, LuDices, LuVideo } from "react-icons/lu";

import { COLOR_PRESETS } from "@/shared/constants/colorPresets";

import { randomPair, sameColor } from "../../common/colorMath";
import ColorSliders from "../../common/ColorSliders";
import {
  useSettingsActions,
  useSettingsSelector,
} from "../../common/useSettingsControls";
import { Chip, ScrollRow } from "../primitives";

type PickerKey = "foreground" | "background";

const PICKERS: { key: PickerKey; label: string }[] = [
  { key: "foreground", label: "Foreground" },
  { key: "background", label: "Background" },
];

const PaletteTool = () => {
  const colorMode = useSettingsSelector((s) => s.colorMode);
  const invert = useSettingsSelector((s) => s.invert);
  const color = useSettingsSelector((s) => s.color);
  const { updateSettings, commitHistory } = useSettingsActions();

  const [picker, setPicker] = useState<PickerKey | null>(null);

  const handleChange = useCallback(
    (key: PickerKey, value: string) =>
      updateSettings({ color: { ...color, [key]: value } }, { history: false }),
    [color, updateSettings]
  );

  const commit = useCallback(() => commitHistory?.(), [commitHistory]);

  return (
    <div className="space-y-3">
      <ScrollRow>
        <Chip
          pressed={colorMode}
          active={colorMode}
          onClick={() => updateSettings({ colorMode: !colorMode })}
        >
          <LuVideo size={14} aria-hidden="true" />
          Live color
        </Chip>
        <Chip
          pressed={invert}
          active={invert}
          onClick={() => updateSettings({ invert: !invert })}
        >
          <LuBlend size={14} aria-hidden="true" />
          Invert
        </Chip>
        <Chip
          disabled={colorMode}
          onClick={() => updateSettings({ color: randomPair() })}
        >
          <LuDices size={14} aria-hidden="true" />
          Random
        </Chip>
        <Chip
          disabled={colorMode}
          onClick={() =>
            updateSettings({
              color: {
                foreground: color.background,
                background: color.foreground,
              },
            })
          }
        >
          <LuArrowLeftRight size={14} aria-hidden="true" />
          Swap
        </Chip>
      </ScrollRow>

      {colorMode ? (
        <p className="rounded-xl border border-line/80 bg-ink-3/40 px-3 py-3 text-[11px] leading-relaxed text-muted">
          Characters use the camera's real colors. Turn off{" "}
          <span className="text-paper">Live color</span> to pick your own
          foreground and background.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {PICKERS.map(({ key, label }) => {
              const open = picker === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-expanded={open}
                  onClick={() => setPicker(open ? null : key)}
                  className={`flex min-h-12 items-center gap-2.5 rounded-xl border px-2.5 text-left transition-colors ${
                    open
                      ? "border-line-strong bg-ink-3"
                      : "border-line/80 bg-ink-3/40 active:bg-ink-3"
                  }`}
                >
                  <span
                    className="size-7 shrink-0 rounded-full border border-line-strong"
                    style={{ backgroundColor: color[key] }}
                  />
                  <span className="min-w-0">
                    <span className="block text-[10px] text-muted">
                      {label}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-faint uppercase">
                      {color[key]}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {picker ? (
            <ColorSliders
              key={picker}
              value={color[picker]}
              onChange={(v) => handleChange(picker, v)}
              onCommit={commit}
            />
          ) : (
            <ScrollRow>
              {COLOR_PRESETS.map((preset) => {
                const active =
                  sameColor(preset.foreground, color.foreground) &&
                  sameColor(preset.background, color.background);
                return (
                  <button
                    key={preset.name}
                    type="button"
                    aria-pressed={active}
                    aria-label={`${preset.name} color preset`}
                    onClick={() =>
                      updateSettings({
                        color: {
                          foreground: preset.foreground,
                          background: preset.background,
                        },
                      })
                    }
                    className="flex w-16 shrink-0 snap-start flex-col items-center gap-1.5 rounded-xl py-1"
                  >
                    <span
                      className={`relative size-11 overflow-hidden rounded-full border-2 transition-all ${
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
                    </span>
                    <span
                      className={`w-full truncate text-center text-[9px] ${
                        active ? "text-signal" : "text-faint"
                      }`}
                    >
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </ScrollRow>
          )}
        </>
      )}
    </div>
  );
};

export default memo(PaletteTool);
