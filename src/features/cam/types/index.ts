import type { AsciiSettings, RenderMode, Size } from "@/shared/types";

export type RenderModeConfig = {
  [T in RenderMode]: {
    key: T;
    label: Uppercase<T>;
  };
}[RenderMode];

export type CameraFacingMode = "user" | "environment";

export type ProcessingStats = {
  fps: number;
  renderTime: number;
};

export interface FrameSource {
  getFrame: () => CanvasImageSource | null;
  isReady: () => boolean;
}

export type ToWorker =
  | { type: "init"; canvas: OffscreenCanvas }
  | { type: "settings"; settings: AsciiSettings }
  | { type: "resize"; width: number; height: number }
  | { type: "frame"; bitmap: ImageBitmap }
  | { type: "getAscii"; id: number; bitmap: ImageBitmap }
  | { type: "capture"; id: number; bitmap: ImageBitmap; outputSize: Size };

export type FromWorker =
  | { type: "ready" }
  | { type: "frameDone" }
  | { type: "stats"; stats: ProcessingStats }
  | { type: "ascii"; id: number; text: string }
  | { type: "captured"; id: number; blob: Blob | null }
  | { type: "error"; message: string; id?: number };
