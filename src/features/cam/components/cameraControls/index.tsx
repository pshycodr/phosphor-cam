import { memo, useCallback, useEffect, useRef, useState } from "react";

import { useSettingsStore } from "../../store/settingsStore";
import { ControlBar } from "./ControlBar";
import { DockCluster } from "./DockCluster";
import type { CameraControlsProps, CaptureMode } from "./types";

const CameraControls = ({
  onFlip,
  onShot,
  onCopy,
  onToggleRecording,
  onOpenSettings,
  isRecording,
  formatTime,
  recordingTime,
  settingsOpen,
  settingsButtonRef,
}: CameraControlsProps) => {
  const [mode, setMode] = useState<CaptureMode>("photo");
  const [flipTurns, setFlipTurns] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const renderMode = useSettingsStore((s) => s.settings.renderMode);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const handleFlip = useCallback(() => {
    setFlipTurns((t) => t + 1);
    onFlip();
  }, [onFlip]);

  const handleCopy = useCallback(() => {
    setIsCopied(true);
    onCopy();
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setIsCopied(false), 1200);
  }, [onCopy]);

  const timeLabel = formatTime(recordingTime);

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      <div className={settingsOpen ? "max-sm:hidden" : ""}>
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-black/60 via-black/25 to-transparent" />

        <ControlBar
          mode={mode}
          onModeChange={setMode}
          isRecording={isRecording}
          isCopied={isCopied}
          flipTurns={flipTurns}
          renderMode={renderMode}
          timeLabel={timeLabel}
          onFlip={handleFlip}
          onShot={onShot}
          onCopy={handleCopy}
          onToggleRecording={onToggleRecording}
          onOpenSettings={onOpenSettings}
          settingsButtonRef={settingsButtonRef}
        />
      </div>

      {settingsOpen && (
        <DockCluster
          mode={mode}
          onModeChange={setMode}
          flipTurns={flipTurns}
          isRecording={isRecording}
          timeLabel={timeLabel}
          onFlip={handleFlip}
          onShot={onShot}
          onToggleRecording={onToggleRecording}
        />
      )}
    </div>
  );
};

export default memo(CameraControls);
