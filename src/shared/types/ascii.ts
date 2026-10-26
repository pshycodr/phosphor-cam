import type { EffectKey } from "./effects";
import type { RenderMode } from "./settings";

export interface EffectProps {
  enabled: boolean;
  intensity: number;
}

export type EffectsSettings = Record<EffectKey, EffectProps>;

export type Codecs = "png" | "jpeg" | "webp";

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
  lineDirection: "horizontal" | "vertical";
  effects: EffectsSettings;
  captureCodec: Codecs;
}

export interface AsciiCharacterMap {
  [key: string]: string;
}
