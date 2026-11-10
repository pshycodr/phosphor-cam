import type { EffectKey } from "@/shared/types";

export interface EffectConfig {
  key: EffectKey;
  label: string;
  description: string;
}

export interface EffectGroup {
  label: string;
  items: EffectConfig[];
}

export const EFFECT_GROUPS: EffectGroup[] = [
  {
    label: "Light",
    items: [
      {
        key: "glow",
        label: "Glow",
        description: "Soft ambient lift across the whole frame.",
      },
      {
        key: "bloom",
        label: "Bloom",
        description: "Wider glow that favors the brightest areas.",
      },
      {
        key: "halation",
        label: "Halation",
        description: "Warm halo around highlights, like film.",
      },
    ],
  },
  {
    label: "Lens",
    items: [
      {
        key: "chromaticAberration",
        label: "Chromatic Aberration",
        description: "Splits color channels apart for a glitchy fringe.",
      },
      {
        key: "vignette",
        label: "Vignette",
        description: "Darkens the corners.",
      },
    ],
  },
  {
    label: "Texture",
    items: [
      {
        key: "scanlines",
        label: "Scanlines",
        description: "Repeating dark lines, like a CRT screen.",
      },
      {
        key: "grain",
        label: "Grain",
        description: "Flickering film-style noise.",
      },
    ],
  },
];
