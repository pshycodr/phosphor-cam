export type RenderMode = "ascii";

export interface AsciiSettings {
  resolution: number;
  fontSize: number;
  contrast: number;
  brightness: number;
  colorMode: boolean;
  invert: boolean;
  characterSet: "standard" | "simple" | "blocks" | "matrix" | "edges";
  renderMode: RenderMode;
  color: {
    foreground: string;
    background: string;
  };
}

export interface AsciiCharacterMap {
  [key: string]: string;
}

export type CameraFacingMode = "user" | "environment";

export type ProcessingStats = {
  fps: number;
  renderTime: number;
};

export interface RendererInstance {
  /** Draw one frame's worth of low-res pixel data onto the visible canvas. */
  render: (
    imageData: ImageData,
    ctx: CanvasRenderingContext2D,
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
  ) => string;

  /** Optional: plain-text export. Only meaningful for the ascii renderer. */
  getAsciiText?: (frame: CanvasImageSource, settings: AsciiSettings) => string;

  /** Optional cleanup - e.g. tearing down a WebGL context for voxel mode. */
  destroy?: () => void;
}

/**
 * A factory receives the visible <canvas> once, and can keep whatever
 * persistent state it needs internally (a WebGL context, a glyph atlas,
 * cached lookup tables) across many render() calls.
 */
export type RendererFactory = (canvas: HTMLCanvasElement) => RendererInstance;

/**
 * Anything that can hand the pipeline a frame to render - a live camera
 * feed today, an uploaded image in the editor tomorrow. The render loop
 * and renderers never know which one they're talking to.
 */
export interface FrameSource {
  /** Returns the current frame, or null if nothing is ready yet. */
  getFrame: () => CanvasImageSource | null;
  /** Cheap readiness check, called every tick before getFrame(). */
  isReady: () => boolean;
}
