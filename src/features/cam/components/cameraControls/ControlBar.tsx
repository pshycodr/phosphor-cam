import type { ReactNode, RefObject } from "react";

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
  rightInset?: boolean;
}

const MobileAction = ({
  ariaLabel,
  caption,
  active = false,
  disabled = false,
  buttonRef,
  onClick,
  children,
}: {
  ariaLabel: string;
  caption: string;
  active?: boolean;
  disabled?: boolean;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    ref={buttonRef}
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className="group flex w-full flex-col items-center gap-2 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-40"
  >
    <span
      className={`press flex size-12 items-center justify-center rounded-full border backdrop-blur-md group-active:scale-95 ${
        active
          ? "border-signal/60 bg-signal/10 text-signal shadow-[0_0_24px_-8px_rgba(56,243,112,0.6)]"
          : "border-line/80 bg-ink-2/70 text-muted group-hover:border-line-strong group-hover:bg-ink-3 group-hover:text-paper"
      }`}
    >
      {children}
    </span>
    <span
      className={`text-[9px] font-medium tracking-[0.16em] uppercase ${
        active ? "text-signal" : "text-faint"
      }`}
    >
      <span aria-live="polite">{caption}</span>
    </span>
  </button>
);

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
    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 pr-[max(0.75rem,env(safe-area-inset-right))] pb-[calc(3rem+env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] sm:gap-3 sm:pb-[calc(1.75rem+env(safe-area-inset-bottom))]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-ink/90 via-ink/35 to-transparent"
      />

      <ModeSwitch mode={mode} disabled={isRecording} onChange={onModeChange} />

      <div className="pointer-events-auto grid w-full max-w-[420px] grid-cols-[1fr_auto_1fr] items-end sm:hidden">
        <div className="flex justify-center">
          <div className="w-14">
            <MobileAction
              ariaLabel="Flip camera"
              caption="Flip"
              onClick={onFlip}
            >
              <RefreshCw
                size={20}
                strokeWidth={1.5}
                aria-hidden="true"
                className="transition-transform duration-300 ease-[var(--ease-out)] motion-reduce:transition-none"
                style={{ transform: `rotate(${flipTurns * 180}deg)` }}
              />
            </MobileAction>
          </div>
        </div>

        <div className="shrink-0">
          <Shutter
            mobile
            isVideo={isVideo}
            isRecording={isRecording}
            recordingLabel={timeLabel}
            onShot={onShot}
            onToggleRecording={onToggleRecording}
          />
        </div>

        <div className="mx-auto grid w-[120px] grid-cols-2 gap-2">
          {renderMode === "ascii" && (
            <MobileAction
              ariaLabel="Copy ASCII text"
              caption={isCopied ? "Copied" : "Copy"}
              active={isCopied}
              onClick={onCopy}
            >
              {isCopied ? (
                <Check
                  size={20}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="pop-in text-signal"
                />
              ) : (
                <Copy
                  size={20}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="text-muted"
                />
              )}
            </MobileAction>
          )}

          <MobileAction
            ariaLabel="Open settings"
            caption="Edit"
            buttonRef={settingsButtonRef}
            disabled={isRecording}
            onClick={onOpenSettings}
          >
            <Settings2
              size={20}
              strokeWidth={1.5}
              aria-hidden="true"
              className="text-muted"
            />
          </MobileAction>
        </div>
      </div>

      <div className="pointer-events-auto relative hidden w-full max-w-[420px] rounded-[22px] border border-line/80 bg-ink-2/80 p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:block">
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
          </div>
        </div>
      </div>
    </div>
  );
};
