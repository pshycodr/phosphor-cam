import {
  type KeyboardEvent,
  memo,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useRef,
} from "react";

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

function decimalsOf(step: number) {
  const s = String(step);
  const i = s.indexOf(".");
  return i < 0 ? 0 : s.length - i - 1;
}

export interface EditorSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Called once when a drag or key press ends (one gesture = one undo step). */
  onCommit?: () => void;
  label: string;
  valueText?: string;
  /** Fill grows from the zero point instead of the left edge. */
  bipolar?: boolean;
  /** Color of the fill and thumb ring. */
  accent?: string;
  /** Replaces the fill with a custom gradient (used by the color sliders). */
  trackBackground?: string;
  /** Values that get a small tick on the track. */
  marks?: number[];
  disabled?: boolean;
}

/**
 * Touch-first slider: 44px tall hit area, 24px thumb, no native range input,
 * so it looks the same on every phone and never fights the browser's own
 * horizontal-scroll gestures.
 */
const EditorSlider = memo(function EditorSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  onCommit,
  label,
  valueText,
  bipolar = false,
  accent = "#22c55e",
  trackBackground,
  marks,
  disabled = false,
}: EditorSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const keyDirty = useRef(false);
  const last = useRef(value);

  const decimals = decimalsOf(step);
  const span = max - min;
  const pct = (v: number) => ((clamp(v, min, max) - min) / span) * 100;

  const snap = useCallback(
    (raw: number) => {
      const n = Math.round((raw - min) / step) * step + min;
      return clamp(Number(n.toFixed(decimals)), min, max);
    },
    [min, max, step, decimals]
  );

  const emit = useCallback(
    (next: number) => {
      if (next === last.current) return;
      last.current = next;
      onChange(next);
    },
    [onChange]
  );

  const fromPointer = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      emit(snap(min + ratio * span));
    },
    [emit, snap, min, span]
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    last.current = value;
    fromPointer(e.clientX);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) fromPointer(e.clientX);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    onCommit?.();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const big = step * Math.max(1, Math.round(span / step / 10));
    let next: number | null = null;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = value + step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = value - step;
        break;
      case "PageUp":
        next = value + big;
        break;
      case "PageDown":
        next = value - big;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
    }
    if (next === null) return;
    e.preventDefault();
    last.current = value;
    keyDirty.current = true;
    emit(snap(next));
  };

  const onKeyUp = () => {
    if (!keyDirty.current) return;
    keyDirty.current = false;
    onCommit?.();
  };

  const origin = bipolar ? pct(0) : 0;
  const current = pct(value);

  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      aria-disabled={disabled || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className={`group relative h-11 w-full touch-none outline-none select-none ${
        disabled ? "opacity-40" : "cursor-pointer"
      }`}
    >
      <div
        ref={trackRef}
        className="absolute inset-x-3 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-green-500/20"
        style={trackBackground ? { background: trackBackground } : undefined}
      >
        {!trackBackground && (
          <div
            className="absolute inset-y-0 rounded-full"
            style={{
              left: `${Math.min(origin, current)}%`,
              width: `${Math.abs(current - origin)}%`,
              backgroundColor: accent,
            }}
          />
        )}

        {bipolar && (
          <span
            aria-hidden="true"
            className="absolute top-1/2 h-3.5 w-px -translate-y-1/2 bg-green-300/50"
            style={{ left: `${origin}%` }}
          />
        )}

        {marks?.map((m) => (
          <span
            key={m}
            aria-hidden="true"
            className="absolute top-1/2 h-3.5 w-px -translate-y-1/2 bg-red-400/70"
            style={{ left: `${pct(m)}%` }}
          />
        ))}

        <div
          aria-hidden="true"
          className="absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white transition-transform group-focus-visible:ring-4 group-focus-visible:ring-green-400/40 group-active:scale-110 motion-reduce:transition-none"
          style={{
            left: `${current}%`,
            borderColor: accent,
            boxShadow: `0 0 12px color-mix(in srgb, ${accent} 55%, transparent)`,
          }}
        />
      </div>
    </div>
  );
});

export default EditorSlider;

/* ----------------------- labelled slider with big readout ----------------------- */

interface SliderFieldProps extends EditorSliderProps {
  /** Text shown as the large live readout. */
  display: ReactNode;
}

export function SliderField({ display, label, ...slider }: SliderFieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 px-0.5">
        <span className="text-xs font-semibold text-green-300">{label}</span>
        <output className="font-mono text-xl leading-none font-bold text-green-400 tabular-nums">
          {display}
        </output>
      </div>
      <EditorSlider label={label} {...slider} />
    </div>
  );
}
