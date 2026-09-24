import type { AsciiSettings } from "@/types";
import type { EffectKey } from "@/types/effects";

import { applyChromaticAberration } from "./chromaticAberration";
import { applyBloom, applyGlow, applyHalation } from "./glow";
import { applyGrain } from "./grain";
import { applyScanlines } from "./scanlines";
import { applyVignette } from "./vignette";

export interface EffectPipelineEntry {
  key: EffectKey;
  apply: (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    intensity: number
  ) => void;
}

export const EFFECT_PIPELINE: EffectPipelineEntry[] = [
  { key: "chromaticAberration", apply: applyChromaticAberration },
  { key: "glow", apply: applyGlow },
  { key: "bloom", apply: applyBloom },
  { key: "halation", apply: applyHalation },
  { key: "vignette", apply: applyVignette },
  { key: "scanlines", apply: applyScanlines },
  { key: "grain", apply: applyGrain },
];

export function runEffectPipeline(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  settings: AsciiSettings
): void {
  for (const { key, apply } of EFFECT_PIPELINE) {
    const effect = settings.effects[key];
    if (effect.enabled) apply(canvas, ctx, effect.intensity);
  }
}
