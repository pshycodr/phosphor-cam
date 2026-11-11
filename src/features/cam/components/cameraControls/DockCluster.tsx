import { Camera, RefreshCw, Video } from "lucide-react";

import { MiniButton } from "./primitives";
import { Shutter } from "./Shutter";
import type { CaptureMode } from "./types";

interface DockClusterProps {
  mode: CaptureMode;
  onModeChange: (mode: CaptureMode) => void;
  flipTurns: number;
  isRecording: boolean;
  timeLabel: string;
  onFlip: () => void;
  onShot: () => void;
  onToggleRecording: () => void;
}

export const DockCluster = ({
  mode,
  onModeChange,
  flipTurns,
  isRecording,
  timeLabel,
  onFlip,
  onShot,
  onToggleRecording,
}: DockClusterProps) => {
  const isVideo = mode === "video";

  return (
    <div
      className="pointer-events-auto absolute right-[max(0.75rem,env(safe-area-inset-right))] flex flex-col items-center gap-3 transition-[bottom] duration-200 motion-reduce:transition-none sm:hidden"
      style={{ bottom: "calc(var(--editor-dock-h, 0px) + 0.75rem)" }}
    >
      <MiniButton
        label={isVideo ? "Switch to photo" : "Switch to video"}
        disabled={isRecording}
        onClick={() => onModeChange(isVideo ? "photo" : "video")}
      >
        {isVideo ? (
          <Video size={20} strokeWidth={1.75} className="text-red-400" />
        ) : (
          <Camera size={20} strokeWidth={1.75} />
        )}
      </MiniButton>

      <MiniButton label="Flip camera" onClick={onFlip}>
        <RefreshCw
          size={20}
          strokeWidth={1.5}
          className="transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `rotate(${flipTurns * 180}deg)` }}
        />
      </MiniButton>

      <Shutter
        compact
        isVideo={isVideo}
        isRecording={isRecording}
        recordingLabel={timeLabel}
        onShot={onShot}
        onToggleRecording={onToggleRecording}
      />
    </div>
  );
};
