import type { EffectKey } from "./effects";
import type { RenderMode } from "./settings";

export interface EffectProps {
  enabled: boolean;
  intensity: number;
}

export type EffectsSettings = Record<EffectKey, EffectProps>;

export type Codecs = "png" | "jpeg" | "webp";

/** Shape of the camera viewport. The stream is center-cropped to it, never scaled. */
export type AspectRatio = "1:1" | "3:4" | "full";

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
  aspectRatio: AspectRatio;
  lineDirection: "horizontal" | "vertical";
  effects: EffectsSettings;
  captureCodec: Codecs;
}

export interface AsciiCharacterMap {
  [key: string]: string;
}
