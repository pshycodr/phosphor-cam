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

  if (!isVideo) {
    return (
      <button
        type="button"
        onClick={onShot}
        aria-label="Capture photo"
        className={`group flex flex-col items-center gap-1.5 rounded-full ${FOCUS_RING}`}
      >
        <span
          className={`flex items-center justify-center rounded-full border-[3px] border-white/80 bg-white/10 backdrop-blur transition-all group-hover:scale-105 group-hover:bg-white/20 group-active:scale-95 ${ring}`}
        >
          <span
            className={`rounded-full bg-white opacity-90 transition-opacity group-hover:opacity-100 ${dot}`}
          />
        </span>
        {!compact && <Label className={IDLE_LABEL}>CAPTURE</Label>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggleRecording}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
      aria-pressed={isRecording}
      className={`group flex flex-col items-center gap-1.5 rounded-full ${FOCUS_RING}`}
    >
      <span
        className={`flex items-center justify-center rounded-full border-[3px] backdrop-blur transition-all ${ring} ${
          isRecording
            ? "border-red-500 bg-red-900/30 group-hover:bg-red-900/40"
            : "border-red-500/80 bg-red-500/10 group-hover:scale-105 group-hover:bg-red-500/20 group-active:scale-95"
        }`}
      >
        <span
          className={`bg-red-500 transition-all ${
            isRecording
              ? `animate-pulse rounded-lg ${stop}`
              : `rounded-full opacity-90 group-hover:opacity-100 ${dot}`
          }`}
        />
      </span>
      {compact ? (
        isRecording && (
          <span className="rounded-full bg-black/70 px-2 py-0.5 font-mono text-[10px] font-bold text-red-400 tabular-nums">
            {recordingLabel}
          </span>
        )
      ) : (
        <Label
          className={
            isRecording ? "font-mono text-red-400 tabular-nums" : IDLE_LABEL
          }
        >
          {isRecording ? recordingLabel : "RECORD"}
        </Label>
      )}
    </button>
  );
};
