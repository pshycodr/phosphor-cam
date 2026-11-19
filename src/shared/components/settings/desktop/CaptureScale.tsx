import { type ChangeEvent, memo, useCallback, useId } from "react";
import { IoWarningOutline } from "react-icons/io5";

import { Range } from "@/shared/ui/controls";

import {
  useSettingsActions,
  useSettingsSelector,
} from "../common/useSettingsControls";

const MIN = 1;
const MAX = 20;
const WARN_THRESHOLD = 12;
const WARN_LEFT_PCT = ((WARN_THRESHOLD - MIN) / (MAX - MIN)) * 100;

const clamp = (value: number) =>
  Math.min(MAX, Math.max(MIN, Math.round(value)));

const CaptureScale = () => {
  const id = useId();
  const captureScale = useSettingsSelector((settings) => settings.captureScale);
  const { updateSettings, commitHistory } = useSettingsActions();

  const value = clamp(captureScale);
  const isHigh = value > WARN_THRESHOLD;

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateSettings(
        { captureScale: clamp(Number(e.target.value)) },
        { history: false }
      );
    },
    [updateSettings]
  );

  const commit = useCallback(() => commitHistory?.(), [commitHistory]);

  return (
    <div>
      <div className="mb-0.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[11px] text-muted">
          Capture scale
        </label>
        <output
          htmlFor={id}
          className={`font-mono text-[11px] tabular-nums ${
            isHigh ? "text-alert" : "text-paper"
          }`}
        >
          {value}x
        </output>
      </div>

      <div className="relative">
        <Range
          id={id}
          min={MIN}
          max={MAX}
          step={1}
          value={value}
          onChange={onChange}
          onPointerUp={commit}
          onKeyUp={commit}
          onBlur={commit}
          aria-valuetext={`${value}x${
            isHigh ? ", may take longer and could fail" : ""
          }`}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 h-2.5 w-px -translate-x-1/2 -translate-y-1/2 bg-alert/50"
          style={{ left: `${WARN_LEFT_PCT}%` }}
        />
      </div>

      <div className="flex justify-between font-mono text-[9px] text-faint tabular-nums">
        <span>{MIN}x</span>
        <span>{MAX}x</span>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ease-[var(--ease-out)] ${
          isHigh
            ? "mt-2 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="flex min-h-0 items-start gap-2 rounded-lg border border-alert/25 bg-alert/5 px-3 py-2 text-[11px] leading-relaxed text-alert">
          <IoWarningOutline
            className="mt-0.5 shrink-0"
            size={13}
            aria-hidden="true"
          />
          <span>
            Above {WARN_THRESHOLD}x takes noticeably longer and may fail on
            large canvases.
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(CaptureScale);
