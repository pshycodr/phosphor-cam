import type { AsciiSettings } from "./ascii";

/** Renderers can now run on the main thread OR inside the worker. */
export type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
export type Ctx2D =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export interface RendererInstance {
  /** Draw one frame's worth of low-res pixel data onto the canvas. */
  render: (
    imageData: ImageData,
    ctx: Ctx2D,
    settings: AsciiSettings,
    cellSize: number
  ) => void;

  /**
   * Optional: produce a high-resolution still (data URL) directly from a
   * raw (non-downsampled) frame. Not every renderer needs to support this.
   */
  captureImage?: (
    frame: CanvasImageSource,
    settings: AsciiSettings,
    outputSize: { width: number; height: number }
  ) => Promise<Blob>;

  /** Optional: plain-text export. Only meaningful for the ascii renderer. */
  getAsciiText?: (frame: CanvasImageSource, settings: AsciiSettings) => string;
}

export type RendererFactory = (canvas: AnyCanvas) => RendererInstance;

export interface FrameSource {
  getFrame: () => CanvasImageSource | null;
  isReady: () => boolean;
}
