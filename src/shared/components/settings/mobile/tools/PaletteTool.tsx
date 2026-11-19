import { memo, useCallback, useState } from "react";
import type { ReactNode } from "react";
import {
  LuArrowLeftRight,
  LuBlend,
  LuChevronDown,
  LuDices,
  LuPalette,
  LuVideo,
  LuX,
} from "react-icons/lu";

import { COLOR_PRESETS } from "@/shared/constants/colorPresets";
import { useBackHandler } from "@/shared/hooks/useBackHandler";

import { randomPair, sameColor } from "../../common/colorMath";
import ColorSliders from "../../common/ColorSliders";
import {
  useSettingsActions,
  useSettingsSelector,
} from "../../common/useSettingsControls";
import { ScrollRow } from "../primitives";

type PickerKey = "foreground" | "background";

const PICKERS: { key: PickerKey; label: string }[] = [
  { key: "foreground", label: "Foreground" },
  { key: "background", label: "Background" },
];

const chipBase =
  "press touch-manipulation inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[11px] whitespace-nowrap select-none";

const ToggleChip = ({
  on,
  onClick,
  icon,
  children,
}: {
  on: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-pressed={on}
    onClick={onClick}
    className={`${chipBase} ${
      on
        ? "border-signal/45 text-signal"
        : "border-line text-muted active:bg-ink-3 active:text-paper"
    }`}
  >
    {icon}
    {children}
  </button>
);

const ActionChip = ({
  onClick,
  disabled,
  icon,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: ReactNode;
  children: ReactNode;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`${chipBase} border-transparent text-muted enabled:active:bg-ink-3 enabled:active:text-paper disabled:opacity-40`}
  >
    {icon}
    {children}
  </button>
);

/* -------------------------------------------------------------------------- */

const PaletteTool = () => {
  const colorMode = useSettingsSelector((s) => s.colorMode);
  const invert = useSettingsSelector((s) => s.invert);
  const color = useSettingsSelector((s) => s.color);
  const { updateSettings, commitHistory } = useSettingsActions();

  const [picker, setPicker] = useState<PickerKey | null>(null);
  // Bumped when colors change from outside the sliders (random / swap /
  // preset) so the sliders remount and re-read the value.
  const [syncKey, setSyncKey] = useState(0);

  useBackHandler(picker !== null, () => setPicker(null));

  const handleChange = useCallback(
    (key: PickerKey, value: string) =>
      updateSettings({ color: { ...color, [key]: value } }, { history: false }),
    [color, updateSettings]
  );

  const commit = useCallback(() => commitHistory?.(), [commitHistory]);

  const applyColors = useCallback(
    (next: { foreground: string; background: string }) => {
      updateSettings({ color: next });
      setSyncKey((k) => k + 1);
    },
    [updateSettings]
  );

  const toggleLiveColor = () => {
    setPicker(null);
    updateSettings({ colorMode: !colorMode });
  };

  const activeLabel = PICKERS.find((p) => p.key === picker)?.label;

  return (
    <div className="space-y-3">
      <ScrollRow>
        <ToggleChip
          on={colorMode}
          onClick={toggleLiveColor}
          icon={<LuVideo size={14} aria-hidden="true" />}
        >
          Live color
        </ToggleChip>
        <ToggleChip
          on={invert}
          onClick={() => updateSettings({ invert: !invert })}
          icon={<LuBlend size={14} aria-hidden="true" />}
        >
          Invert
        </ToggleChip>

        <span
          aria-hidden="true"
          className="mx-1 h-4 w-px shrink-0 self-center bg-line"
        />

        <ActionChip
          disabled={colorMode}
          onClick={() => applyColors(randomPair())}
          icon={<LuDices size={14} aria-hidden="true" />}
        >
          Random
        </ActionChip>
        <ActionChip
          disabled={colorMode}
          onClick={() =>
            applyColors({
              foreground: color.background,
              background: color.foreground,
            })
          }
          icon={<LuArrowLeftRight size={14} aria-hidden="true" />}
        >
          Swap
        </ActionChip>
      </ScrollRow>

      {colorMode ? (
        <p className="rounded-xl border border-line/80 bg-ink-3/40 px-3 py-3 text-[11px] leading-relaxed text-muted">
          Characters use the camera's real colors. Turn off{" "}
          <span className="text-paper">Live color</span> to pick your own
          foreground and background.
        </p>
      ) : (
        <>
          <div
            role="group"
            aria-label="Choose color to edit"
            className="grid grid-cols-2 gap-2"
          >
            {PICKERS.map(({ key, label }) => {
              const open = picker === key;
              const dimmed = picker !== null && !open;
              return (
                <button
                  key={key}
                  type="button"
                  aria-expanded={open}
                  aria-controls="palette-sliders"
                  onClick={() => setPicker(open ? null : key)}
                  className={`press flex min-h-14 touch-manipulation items-center gap-2.5 rounded-xl border px-2.5 text-left ${
                    open
                      ? "border-line-strong bg-ink-4"
                      : "border-line bg-transparent active:bg-ink-3"
                  } ${dimmed ? "opacity-60" : ""}`}
                >
                  <span
                    className={`size-8 shrink-0 rounded-full border transition-colors duration-200 ${
                      open ? "border-paper/50" : "border-line-strong"
                    }`}
                    style={{ backgroundColor: color[key] }}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[10px] transition-colors duration-200 ${
                        open ? "text-paper" : "text-muted"
                      }`}
                    >
                      {label}
                    </span>
                    <span className="tabular block truncate font-mono text-[10px] text-faint uppercase">
                      {color[key]}
                    </span>
                  </span>
                  {open ? (
                    <LuX
                      size={16}
                      aria-hidden="true"
                      className="shrink-0 text-muted"
                    />
                  ) : (
                    <LuChevronDown
                      size={16}
                      aria-hidden="true"
                      className="shrink-0 text-faint"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {picker ? (
            <div id="palette-sliders" className="notice-enter space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.12em] text-faint uppercase">
                  Editing{" "}
                  <span className="text-signal">
                    {activeLabel?.toLowerCase()}
                  </span>
                </span>
                {/* 32px visual pill, extended to a 44px touch target */}
                <button
                  type="button"
                  onClick={() => setPicker(null)}
                  className="press relative inline-flex h-8 touch-manipulation items-center gap-1.5 rounded-full border border-line px-3 text-[11px] text-muted before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[''] active:bg-ink-3 active:text-paper"
                >
                  <LuPalette size={12} aria-hidden="true" />
                  Presets
                </button>
              </div>

              <ColorSliders
                key={`${picker}-${syncKey}`}
                value={color[picker]}
                onChange={(v) => handleChange(picker, v)}
                onCommit={commit}
              />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.12em] text-faint uppercase">
                  Presets
                </span>
                <span className="text-[10px] text-faint">
                  Tap a color to fine-tune
                </span>
              </div>
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
                        applyColors({
                          foreground: preset.foreground,
                          background: preset.background,
                        })
                      }
                      className="press flex min-h-16 w-16 shrink-0 touch-manipulation snap-start flex-col items-center gap-1.5 rounded-xl py-1"
                    >
                      <span
                        className={`relative size-11 overflow-hidden rounded-full border transition-colors duration-200 ${
                          active ? "border-signal/70" : "border-line-strong"
                        }`}
                        style={{ backgroundColor: preset.background }}
                      >
                        <span
                          className="absolute inset-y-0 right-0 w-1/2"
                          style={{ backgroundColor: preset.foreground }}
                        />
                      </span>
                      <span
                        className={`w-full truncate text-center text-[9px] transition-colors duration-200 ${
                          active ? "text-paper" : "text-faint"
                        }`}
                      >
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </ScrollRow>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default memo(PaletteTool);
