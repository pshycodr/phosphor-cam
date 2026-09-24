export type EffectKey =
  | "glow"
  | "bloom"
  | "halation"
  | "chromaticAberration"
  | "vignette"
  | "scanlines"
  | "grain";

export interface GlowPassOptions {
  /** radius in px */
  blur: number;
  /** Alpha of the additive composite / effect strength. */
  strength: number;
  /** Pre-blur brightness boost */
  brightness?: number;
  /** Pre-blur contrast (%) */
  contrast?: number;
  /** Fraction of canvas size to blur at (0-1). Lower = cheaper & softer. */
  downsample?: number;
  /** CSS color. Tints the copy via "multiply" before blurring - black
   *  stays black, so this only colors regions that already had content. */
  tint?: string;
}
