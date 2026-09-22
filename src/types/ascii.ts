import type { RenderMode } from "./settings";

export interface AsciiSettings {
  voxel3d: boolean;
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
  captureScale: number;
}

export interface AsciiCharacterMap {
  [key: string]: string;
}
