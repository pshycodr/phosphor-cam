import type { RenderMode } from "./settings";

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
