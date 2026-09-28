import type { AsciiSettings, ProcessingStats } from "@/types";

export type Size = { width: number; height: number };

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
