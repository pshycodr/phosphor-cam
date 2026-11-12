import type { RefObject } from "react";

import { Check, Copy, RefreshCw, Settings2 } from "lucide-react";

import type { RenderMode } from "@/shared/types";

import { ModeSwitch } from "./ModeSwitch";
import { SideButton } from "./primitives";
import { Shutter } from "./Shutter";
import type { CaptureMode } from "./types";

interface ControlBarProps {
  mode: CaptureMode;
  onModeChange: (mode: CaptureMode) => void;
  isRecording: boolean;
  isCopied: boolean;
  flipTurns: number;
  renderMode: RenderMode;
  timeLabel: string;
  onFlip: () => void;
  onShot: () => void;
  onCopy: () => void;
  onToggleRecording: () => void;
  onOpenSettings: () => void;
  settingsButtonRef: RefObject<HTMLButtonElement | null>;
}

export const ControlBar = ({
  mode,
  onModeChange,
  isRecording,
  isCopied,
  flipTurns,
  renderMode,
  timeLabel,
  onFlip,
  onShot,
  onCopy,
  onToggleRecording,
  onOpenSettings,
  settingsButtonRef,
}: ControlBarProps) => {
  const isVideo = mode === "video";

  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-ink/80 via-ink/30 to-transparent"
      />

      <ModeSwitch mode={mode} disabled={isRecording} onChange={onModeChange} />

      <div className="pointer-events-auto relative w-full max-w-[420px] rounded-[22px] border border-line/80 bg-ink-2/80 p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center justify-center">
            <SideButton ariaLabel="Flip camera" caption="Flip" onClick={onFlip}>
              <RefreshCw
                size={20}
                strokeWidth={1.5}
                aria-hidden="true"
                className="transition-transform duration-300 ease-[var(--ease-out)] motion-reduce:transition-none"
                style={{ transform: `rotate(${flipTurns * 180}deg)` }}
              />
            </SideButton>
          </div>

          <div className="px-3 min-[380px]:px-5">
            <Shutter
              isVideo={isVideo}
              isRecording={isRecording}
              recordingLabel={timeLabel}
              onShot={onShot}
              onToggleRecording={onToggleRecording}
            />
          </div>

          <div className="flex items-center justify-center gap-1.5">
            {renderMode === "ascii" && (
              <SideButton
                ariaLabel="Copy ASCII text"
                caption={isCopied ? "Copied" : "Copy"}
                captionClassName={isCopied ? "text-signal" : undefined}
                active={isCopied}
                onClick={onCopy}
              >
                {isCopied ? (
                  <Check
                    size={20}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="text-signal"
                  />
                ) : (
                  <Copy
                    size={20}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="text-muted"
                  />
                )}
              </SideButton>
            )}

            <SideButton
              ariaLabel="Open settings"
              caption="Edit"
              buttonRef={settingsButtonRef}
              className="sm:hidden"
              disabled={isRecording}
              onClick={onOpenSettings}
            >
              <Settings2
                size={20}
                strokeWidth={1.5}
                aria-hidden="true"
                className="text-muted"
              />
            </SideButton>
          </div>
        </div>
      </div>
    </div>
  );
};
