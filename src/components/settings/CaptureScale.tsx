import { type ChangeEvent, memo, useCallback, useMemo } from "react";
import { IoWarningOutline } from "react-icons/io5";

import { useSettingsStore } from "@/store/settingsStore";

const MIN = 1;
const MAX = 20;
const WARN_THRESHOLD = 12;

const GREEN: [number, number, number] = [34, 197, 94];
const RED: [number, number, number] = [239, 68, 68];

const clamp = (value: number) =>
  Math.min(MAX, Math.max(MIN, Math.round(value)));

function scaleColorParts(value: number): [number, number, number] {
  if (value <= WARN_THRESHOLD) return GREEN;
  const t = (value - WARN_THRESHOLD) / (MAX - WARN_THRESHOLD);
  return GREEN.map((c, i) => Math.round(c + (RED[i] - c) * t)) as [
    number,
    number,
    number,
  ];
}

// Where WARN_THRESHOLD sits along the track, for the marker tick below.
const WARN_LEFT_PCT = ((WARN_THRESHOLD - MIN) / (MAX - MIN)) * 100;

const CaptureScale = () => {
  const captureScale = useSettingsStore((s) => s.settings.captureScale);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const value = clamp(captureScale);
  const isHigh = value > WARN_THRESHOLD;

  const [r, g, b] = useMemo(() => scaleColorParts(value), [value]);
  const solidColor = `rgb(${r}, ${g}, ${b})`;

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateSettings({ captureScale: clamp(Number(e.target.value)) });
    },
    [updateSettings]
  );

  return (
    <div className="py-1">
      <label
        htmlFor="capture-scale"
        className="mb-1 block text-xs font-semibold text-green-400"
      >
        Capture scale
      </label>

      <div className="flex w-full items-center justify-end">
        <span
          className="text-lg leading-none font-bold tabular-nums transition-colors duration-300"
          style={{ color: solidColor }}
        >
          {value}
        </span>
        <span
          className="text-lg font-semibold transition-colors duration-300"
          style={{ color: solidColor }}
        >
          x
        </span>
      </div>

      <div className="relative">
        <input
          id="capture-scale"
          type="range"
          min={MIN}
          max={MAX}
          step={1}
          value={value}
          onChange={onChange}
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={value}
          aria-valuetext={`${value}x${
            isHigh ? ", may take longer and could fail" : ""
          }`}
          style={{ accentColor: solidColor }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-green-500/20 outline-none focus-visible:ring-2 focus-visible:ring-green-400/70"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-red-400/50"
          style={{ left: `${WARN_LEFT_PCT}%` }}
        />
      </div>

      <div className="mt-1 flex justify-between text-[10px] text-gray-500">
        <span>{MIN}x</span>
        <span>{MAX}x</span>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ${
          isHigh
            ? "mt-3 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="flex min-h-0 items-start gap-2 rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs text-red-400">
          <IoWarningOutline
            className="mt-0.5 shrink-0"
            size={14}
            aria-hidden="true"
          />
          <span>
            Scales above {WARN_THRESHOLD}x take noticeably longer to capture and
            may fail or crash on large canvases.
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(CaptureScale);
