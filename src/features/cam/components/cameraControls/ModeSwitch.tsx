import { FOCUS_RING } from "./styles";
import type { CaptureMode } from "./types";

export const ModeSwitch = ({
  mode,
  disabled,
  onChange,
}: {
  mode: CaptureMode;
  disabled: boolean;
  onChange: (mode: CaptureMode) => void;
}) => {
  const isVideo = mode === "video";

  return (
    <div
      role="group"
      aria-label="Capture mode"
      className={`pointer-events-auto relative grid grid-cols-2 rounded-full border border-green-500/30 bg-black/50 p-1 backdrop-blur-md ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full transition-[translate,background-color] duration-300 ease-out motion-reduce:transition-none ${
          isVideo ? "translate-x-full bg-red-600" : "bg-green-600"
        }`}
      />
      <button
        type="button"
        onClick={() => onChange("photo")}
        disabled={disabled}
        aria-pressed={!isVideo}
        className={`relative z-10 min-w-24 rounded-full px-5 py-2 text-xs font-bold tracking-wider transition-colors disabled:cursor-not-allowed [@media(max-height:480px)]:py-1 ${FOCUS_RING} ${
          isVideo ? "text-green-400 hover:text-green-300" : "text-black"
        }`}
      >
        PHOTO
      </button>
      <button
        type="button"
        onClick={() => onChange("video")}
        disabled={disabled}
        aria-pressed={isVideo}
        className={`relative z-10 min-w-24 rounded-full px-5 py-2 text-xs font-bold tracking-wider transition-colors disabled:cursor-not-allowed [@media(max-height:480px)]:py-1 ${FOCUS_RING} ${
          isVideo ? "text-black" : "text-red-400 hover:text-red-300"
        }`}
      >
        VIDEO
      </button>
    </div>
  );
};
