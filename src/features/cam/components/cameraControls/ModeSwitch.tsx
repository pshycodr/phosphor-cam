import { FOCUS_RING } from "./styles";
import type { CaptureMode } from "./types";

const MODES: { key: CaptureMode; label: string }[] = [
  { key: "photo", label: "Photo" },
  { key: "video", label: "Video" },
];

export const ModeSwitch = ({
  mode,
  disabled,
  onChange,
}: {
  mode: CaptureMode;
  disabled: boolean;
  onChange: (mode: CaptureMode) => void;
}) => {
  const index = mode === "video" ? 1 : 0;

  return (
    <div
      role="group"
      aria-label="Capture mode"
      className={`pointer-events-auto relative grid grid-cols-2 rounded-full border border-line/80 bg-ink/70 p-0.5 backdrop-blur-md ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-0.125rem)] rounded-full bg-paper transition-transform duration-200 ease-[var(--ease-out)]"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {MODES.map(({ key, label }) => {
        const active = mode === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            disabled={disabled}
            aria-pressed={active}
            className={`relative z-10 min-h-8 min-w-20 rounded-full px-4 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors duration-150 disabled:cursor-not-allowed [@media(max-height:520px)]:min-h-7 ${FOCUS_RING} ${
              active ? "text-ink" : "text-muted hover:text-paper"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
