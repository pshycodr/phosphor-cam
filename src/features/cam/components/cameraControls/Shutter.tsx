import { Label } from "./primitives";
import {
  FOCUS_RING,
  IDLE_LABEL,
  SHUTTER_DOT,
  SHUTTER_SIZE,
  STOP_DOT,
} from "./styles";

export const Shutter = ({
  isVideo,
  isRecording,
  compact = false,
  recordingLabel,
  onShot,
  onToggleRecording,
}: {
  isVideo: boolean;
  isRecording: boolean;
  compact?: boolean;
  recordingLabel: string;
  onShot: () => void;
  onToggleRecording: () => void;
}) => {
  const ring = compact ? "size-16" : SHUTTER_SIZE;
  const dot = compact ? "size-12" : SHUTTER_DOT;
  const stop = compact ? "size-5" : STOP_DOT;

  const caption = isRecording ? (
    <Label className="text-signal">
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="recording-dot size-1.5 rounded-full bg-signal"
        />
        <span className="tabular-nums">{recordingLabel}</span>
      </span>
    </Label>
  ) : (
    <Label className={IDLE_LABEL}>{isVideo ? "Record" : "Capture"}</Label>
  );

  if (!isVideo) {
    return (
      <button
        type="button"
        onClick={onShot}
        aria-label="Capture photo"
        className={`group flex flex-col items-center gap-2 rounded-full ${FOCUS_RING}`}
      >
        <span
          className={`flex items-center justify-center rounded-full border-2 border-paper/60 bg-ink-2/50 transition-all duration-150 group-hover:border-paper group-active:scale-95 ${ring}`}
        >
          <span
            className={`rounded-full bg-paper opacity-95 transition-all duration-150 group-hover:bg-white group-hover:opacity-100 ${dot}`}
          />
        </span>
        {!compact && caption}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggleRecording}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
      aria-pressed={isRecording}
      className={`group flex flex-col items-center gap-2 rounded-full ${FOCUS_RING}`}
    >
      <span
        className={`flex items-center justify-center rounded-full border-2 transition-all duration-150 ${ring} ${
          isRecording
            ? "border-signal/80 bg-signal/10"
            : "border-paper/60 bg-ink-2/50 group-hover:border-paper group-active:scale-95"
        }`}
      >
        <span
          className={`transition-all duration-200 ${
            isRecording
              ? `rounded-[5px] bg-signal ${stop}`
              : `rounded-full bg-paper opacity-95 group-hover:bg-white group-hover:opacity-100 ${dot}`
          }`}
        />
      </span>
      {compact
        ? isRecording && (
            <span className="rounded-full border border-line/80 bg-ink-2/85 px-2 py-0.5 font-mono text-[10px] text-signal tabular-nums backdrop-blur-md">
              {recordingLabel}
            </span>
          )
        : caption}
    </button>
  );
};
