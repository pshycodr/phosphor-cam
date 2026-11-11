import type { RefObject } from "react";

import { Check, Copy, RefreshCw, Settings2 } from "lucide-react";

import type { RenderMode } from "@/shared/types";

import { ModeSwitch } from "./ModeSwitch";
import { SideButton } from "./primitives";
import { Shutter } from "./Shutter";
import { IDLE_LABEL } from "./styles";
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
    <div className="absolute inset-x-0 bottom-20 flex flex-col items-center gap-5 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:bottom-0 md:gap-6 md:pb-10 [@media(max-height:480px)]:gap-2 [@media(max-height:480px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <ModeSwitch mode={mode} disabled={isRecording} onChange={onModeChange} />

      <div className="pointer-events-auto grid w-full max-w-md grid-cols-[1fr_auto_1fr] items-end md:max-w-xl [@media(max-height:480px)]:items-center">
        <div className="flex items-end justify-center gap-2 [@media(max-height:480px)]:items-center">
          <SideButton ariaLabel="Flip camera" caption="FLIP" onClick={onFlip}>
            <RefreshCw
              size={22}
              strokeWidth={1.5}
              className="text-white transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `rotate(${flipTurns * 180}deg)` }}
            />
          </SideButton>
        </div>

        <div className="px-2 min-[380px]:px-4">
          <Shutter
            isVideo={isVideo}
            isRecording={isRecording}
            recordingLabel={timeLabel}
            onShot={onShot}
            onToggleRecording={onToggleRecording}
          />
        </div>

        <div className="flex items-end justify-center gap-2 [@media(max-height:480px)]:items-center">
          {renderMode === "ascii" && (
            <SideButton
              ariaLabel="Copy ASCII text"
              caption={isCopied ? "COPIED" : "COPY"}
              captionClassName={isCopied ? "text-green-400" : IDLE_LABEL}
              active={isCopied}
              onClick={onCopy}
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
          )}

          <SideButton
            ariaLabel="Open settings"
            caption="EDIT"
            buttonRef={settingsButtonRef}
            className="sm:hidden"
            disabled={isRecording}
            onClick={onOpenSettings}
          >
            <Settings2 size={22} strokeWidth={1.5} className="text-white" />
          </SideButton>
        </div>
      </div>
    </div>
  );
};
