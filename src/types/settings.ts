export type RenderMode = "ascii" | "dither" | "halftone";

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

export type ColorPreset = {
  readonly name: string;
  readonly foreground: `#${string}`;
  readonly background: `#${string}`;
};
