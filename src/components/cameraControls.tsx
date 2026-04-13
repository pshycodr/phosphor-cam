import { memo, useState } from "react";

import { Check,Copy, RefreshCw } from "lucide-react";

type CameraControlsProps = {
  onFlip: () => void;
  onShot: () => void;
  onCopy: () => void;
  onToggleRecording: () => void;
  isRecording: boolean;
  formatTime: (seconds: number) => string;
  recordingTime: number;
};

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
  const [isFlipping, setIsFlipping] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleFlip = () => {
    setIsFlipping((prev) => !prev);
    onFlip();
    setTimeout(() => setIsFlipping((prev) => !prev), 600);
  };

  const handleCopy = () => {
    setIsCopied(true);
    onCopy();
    setTimeout(() => setIsCopied(false), 1000);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 flex flex-col items-center gap-6 pb-8 md:pb-10">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-green-500/30 bg-black/50 p-1 backdrop-blur-md">
        <button
          onClick={() => setMode("photo")}
          className={`rounded-full px-6 py-2 text-xs font-bold tracking-wider transition-all ${
            mode === "photo"
              ? "bg-green-600 text-black"
              : "text-green-400 hover:text-green-300"
          }`}
        >
          PHOTO
        </button>
        <button
          onClick={() => setMode("video")}
          className={`rounded-full px-6 py-2 text-xs font-bold tracking-wider transition-all ${
            mode === "video"
              ? "bg-red-600 text-black"
              : "text-red-400 hover:text-red-300"
          }`}
        >
          VIDEO
        </button>
      </div>

      <div className="pointer-events-auto flex items-end justify-center gap-8 px-4 md:gap-12">
        <button
          onClick={handleFlip}
          className="group flex flex-col items-center gap-1.5 focus:outline-none"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-green-500/30 bg-black/40 backdrop-blur transition-all group-hover:border-green-400 group-hover:bg-green-900/30 md:h-16 md:w-16">
            <RefreshCw
              size={22}
              strokeWidth={1.5}
              className={`text-white transition-transform duration-600 ${isFlipping ? "rotate-180" : ""}`}
            />
          </div>
          <span className="text-[9px] font-bold tracking-widest text-white opacity-70 group-hover:opacity-100 md:text-[10px]">
            FLIP
          </span>
        </button>

        {mode === "photo" ? (
          <button
            onClick={onShot}
            className="group flex flex-col items-center gap-1.5 focus:outline-none"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-white/80 bg-white/10 backdrop-blur transition-all group-hover:scale-105 group-hover:bg-white/20 group-active:scale-95 md:h-24 md:w-24">
              <div className="h-16 w-16 rounded-full bg-white opacity-90 group-hover:opacity-100 md:h-20 md:w-20"></div>
            </div>
            <span className="text-[9px] font-bold tracking-widest text-white opacity-70 group-hover:opacity-100 md:text-[10px]">
              CAPTURE
            </span>
          </button>
        ) : (
          <button
            onClick={onToggleRecording}
            className="group flex flex-col items-center gap-1.5 focus:outline-none"
          >
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full border-[3px] backdrop-blur transition-all md:h-24 md:w-24 ${
                isRecording
                  ? "border-red-500 bg-red-900/30 group-hover:bg-red-900/40"
                  : "border-red-500/80 bg-red-500/10 group-hover:scale-105 group-hover:bg-red-500/20 group-active:scale-95"
              }`}
            >
              <div
                className={`bg-red-500 transition-all ${
                  isRecording
                    ? "h-7 w-7 animate-pulse rounded-lg md:h-8 md:w-8"
                    : "h-16 w-16 rounded-full opacity-90 group-hover:opacity-100 md:h-20 md:w-20"
                }`}
              ></div>
            </div>
            <span
              className={`text-[9px] font-bold tracking-widest transition-colors md:text-[10px] ${
                isRecording
                  ? "font-mono text-red-400"
                  : "text-white opacity-70 group-hover:opacity-100"
              }`}
            >
              {isRecording ? formatTime(recordingTime) : "RECORD"}
            </span>
          </button>
        )}

        <button
          onClick={handleCopy}
          className="group flex flex-col items-center gap-1.5 focus:outline-none"
        >
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full border backdrop-blur transition-all md:h-16 md:w-16 ${
              isCopied
                ? "scale-110 border-green-400 bg-green-900/40"
                : "border-green-500/30 bg-black/40 group-hover:border-green-400 group-hover:bg-green-900/30"
            }`}
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
          </div>
          <span
            className={`text-[9px] font-bold tracking-widest transition-colors md:text-[10px] ${
              isCopied
                ? "text-green-400"
                : "text-white opacity-70 group-hover:opacity-100"
            }`}
          >
            {isCopied ? "COPIED" : "COPY"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default memo(CameraControls);
