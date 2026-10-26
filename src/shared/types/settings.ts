export type RenderMode = "ascii" | "dither" | "halftone" | "voxel" | "lines";

export type ColorPreset = {
  readonly name: string;
  readonly foreground: `#${string}`;
  readonly background: `#${string}`;
};
