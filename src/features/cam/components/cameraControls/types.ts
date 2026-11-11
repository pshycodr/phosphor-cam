import type { RefObject } from "react";

export type CaptureMode = "photo" | "video";

export type CameraControlsProps = {
  onFlip: () => void;
  onShot: () => void;
  onCopy: () => void;
  onToggleRecording: () => void;
  onOpenSettings: () => void;
  isRecording: boolean;
  formatTime: (seconds: number) => string;
  recordingTime: number;
  settingsOpen: boolean;
  settingsButtonRef: RefObject<HTMLButtonElement | null>;
};
