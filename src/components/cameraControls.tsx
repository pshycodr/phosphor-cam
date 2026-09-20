import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Check, Copy, RefreshCw } from "lucide-react";

type CameraControlsProps = {
  onFlip: () => void;
  onShot: () => void;
  onCopy: () => void;
  onToggleRecording: () => void;
  isRecording: boolean;
  formatTime: (seconds: number) => string;
  recordingTime: number;
};

const SIDE_SIZE = "size-14 md:size-16 [@media(max-height:480px)]:size-11";
const SHUTTER_SIZE = "size-20 md:size-24 [@media(max-height:480px)]:size-16";
const SHUTTER_DOT = "size-16 md:size-20 [@media(max-height:480px)]:size-12";
const STOP_DOT = "size-7 md:size-8 [@media(max-height:480px)]:size-6";
const HIDE_WHEN_SHORT = "[@media(max-height:480px)]:hidden";

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-green-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

const Label = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={`text-[10px] font-bold tracking-widest transition-colors md:text-[11px] ${HIDE_WHEN_SHORT} ${className}`}
  >
    {children}
  </span>
);

const IDLE_LABEL = "text-white/70 group-hover:text-white";

const SideButton = ({
  ariaLabel,
  caption,
  captionClassName = IDLE_LABEL,
  active = false,
  onClick,
  children,
}: {
  ariaLabel: string;
  caption: string;
  captionClassName?: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={`group flex flex-col items-center gap-1.5 rounded-2xl ${FOCUS_RING}`}
  >
    <span
      className={`flex items-center justify-center rounded-full border backdrop-blur transition-all group-active:scale-95 ${SIDE_SIZE} ${
        active
          ? "scale-110 border-green-400 bg-green-900/40"
          : "border-green-500/30 bg-black/40 group-hover:border-green-400 group-hover:bg-green-900/30"
      }`}
    >
      {children}
    </span>
    <Label className={captionClassName}>
      <span aria-live="polite">{caption}</span>
    </Label>
  </button>
);

const CameraControls = ({
  onFlip,
  onShot,
  onCopy,
  onToggleRecording,
  isRecording,
  formatTime,
  recordingTime,
}: CameraControlsProps) => {
  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [flipTurns, setFlipTurns] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const handleFlip = useCallback(() => {
    // Keep spinning the same direction instead of snapping back.
    setFlipTurns((t) => t + 1);
    onFlip();
  }, [onFlip]);

  const handleCopy = useCallback(() => {
    setIsCopied(true);
    onCopy();
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setIsCopied(false), 1200);
  }, [onCopy]);

  const isVideo = mode === "video";

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-20 flex flex-col items-center gap-5 bg-linear-to-t from-black/60 via-black/25 to-transparent px-4 pt-14 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:gap-6 md:pb-10 [@media(max-height:480px)]:gap-2 [@media(max-height:480px)]:pt-6 [@media(max-height:480px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))]`}
    >
      {/* Mode switch */}
      <div
        role="group"
        aria-label="Capture mode"
        className={`pointer-events-auto relative grid grid-cols-2 rounded-full border border-green-500/30 bg-black/50 p-1 backdrop-blur-md ${
          isRecording ? "opacity-60" : ""
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
          onClick={() => setMode("photo")}
          disabled={isRecording}
          aria-pressed={!isVideo}
          className={`relative z-10 min-w-24 rounded-full px-5 py-2 text-xs font-bold tracking-wider transition-colors disabled:cursor-not-allowed [@media(max-height:480px)]:py-1 ${FOCUS_RING} ${
            isVideo ? "text-green-400 hover:text-green-300" : "text-black"
          }`}
        >
          PHOTO
        </button>
        <button
          type="button"
          onClick={() => setMode("video")}
          disabled={isRecording}
          aria-pressed={isVideo}
          className={`relative z-10 min-w-24 rounded-full px-5 py-2 text-xs font-bold tracking-wider transition-colors disabled:cursor-not-allowed [@media(max-height:480px)]:py-1 ${FOCUS_RING} ${
            isVideo ? "text-black" : "text-red-400 hover:text-red-300"
          }`}
        >
          VIDEO
        </button>
      </div>

      {/* Actions */}
      <div className="pointer-events-auto flex items-end justify-center gap-7 md:gap-12 [@media(max-height:480px)]:items-center [@media(max-height:480px)]:gap-6">
        <SideButton ariaLabel="Flip camera" caption="FLIP" onClick={handleFlip}>
          <RefreshCw
            size={22}
            strokeWidth={1.5}
            className="text-white transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `rotate(${flipTurns * 180}deg)` }}
          />
        </SideButton>

        {!isVideo ? (
          <button
            type="button"
            onClick={onShot}
            aria-label="Capture photo"
            className={`group flex flex-col items-center gap-1.5 rounded-full ${FOCUS_RING}`}
          >
            <span
              className={`flex items-center justify-center rounded-full border-[3px] border-white/80 bg-white/10 backdrop-blur transition-all group-hover:scale-105 group-hover:bg-white/20 group-active:scale-95 ${SHUTTER_SIZE}`}
            >
              <span
                className={`rounded-full bg-white opacity-90 transition-opacity group-hover:opacity-100 ${SHUTTER_DOT}`}
              />
            </span>
            <Label className={IDLE_LABEL}>CAPTURE</Label>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleRecording}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            aria-pressed={isRecording}
            className={`group flex flex-col items-center gap-1.5 rounded-full ${FOCUS_RING}`}
          >
            <span
              className={`flex items-center justify-center rounded-full border-[3px] backdrop-blur transition-all ${SHUTTER_SIZE} ${
                isRecording
                  ? "border-red-500 bg-red-900/30 group-hover:bg-red-900/40"
                  : "border-red-500/80 bg-red-500/10 group-hover:scale-105 group-hover:bg-red-500/20 group-active:scale-95"
              }`}
            >
              <span
                className={`bg-red-500 transition-all ${
                  isRecording
                    ? `animate-pulse rounded-lg ${STOP_DOT}`
                    : `rounded-full opacity-90 group-hover:opacity-100 ${SHUTTER_DOT}`
                }`}
              />
            </span>
            <Label
              className={
                isRecording ? "font-mono text-red-400 tabular-nums" : IDLE_LABEL
              }
            >
              {isRecording ? formatTime(recordingTime) : "RECORD"}
            </Label>
          </button>
        )}

        <SideButton
          ariaLabel="Copy ASCII text"
          caption={isCopied ? "COPIED" : "COPY"}
          captionClassName={isCopied ? "text-green-400" : IDLE_LABEL}
          active={isCopied}
          onClick={handleCopy}
        >
          {isCopied ? (
            <Check
              size={22}
              strokeWidth={2.5}
              className="animate-in fade-in zoom-in text-green-400 duration-200"
            />
          ) : (
            <Copy size={22} strokeWidth={1.5} className="text-white" />
          )}
        </SideButton>
      </div>
    </div>
  );
};

export default memo(CameraControls);
