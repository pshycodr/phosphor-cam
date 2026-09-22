import { adjustColor } from "@/utils/asciiUtils";
import { hexToRgb } from "@/utils/ditherUtils";

export const VOXEL_COLORS: Array<[number, number, number]> = [
  [0, 0, 0],
  [255, 255, 255],
  [196, 40, 28],
  [13, 105, 172],
  [245, 205, 47],
  [40, 127, 70],
  [155, 154, 151],
  [100, 100, 100],
  [75, 151, 74],
  [156, 30, 44],
  [52, 77, 158],
  [237, 145, 44],
  [120, 82, 40],
  [180, 150, 200],
  [254, 239, 184],
  [183, 195, 207],
  [227, 153, 190],
  [86, 186, 158],
  [143, 213, 66],
  [224, 132, 96],
  [120, 150, 200],
  [168, 145, 100],
];

/**
 * 16-step color ramp from background -> foreground, used as the mono-mode
 * voxel palette in place of a fixed grayscale ramp. Mirrors how dither's
 * mono path maps "off" pixels to background and "on" pixels to foreground -
 * dark cells here land near `background`, bright cells near `foreground`,
 * with in-between quantization levels interpolated linearly per channel.
 */
export function buildThemeRamp(
  foreground: string,
  background: string,
  steps = 16
): Array<[number, number, number]> {
  const [fr, fg, fb] = hexToRgb(foreground);
  const [br, bg, bb] = hexToRgb(background);
  const last = Math.max(1, steps - 1);
  return Array.from({ length: steps }, (_, i): [number, number, number] => {
    const t = i / last;
    return [
      Math.round(br + (fr - br) * t),
      Math.round(bg + (fg - bg) * t),
      Math.round(bb + (fb - bb) * t),
    ];
  });
}

export const Q_BITS = 5;
export const Q_SHIFT = 8 - Q_BITS;
export const Q_SIZE = 1 << (Q_BITS * 3);

export const BAYER4 = new Uint8Array([
  0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5,
]);
export const DITHER_STRENGTH = 24;

export type Palette = {
  colors: Array<[number, number, number]>;
  lut: Uint8Array;
  flatRgb: Uint8Array;
};

export type Atlas = {
  canvas: HTMLCanvasElement;
  sprite: number;
  count: number;
};

/** Pre-quantizes a palette into a 5-bit/channel nearest-color LUT. */
export function buildPalette(colors: Array<[number, number, number]>): Palette {
  const n = colors.length;
  const lut = new Uint8Array(Q_SIZE);

  for (let qr = 0; qr < 1 << Q_BITS; qr++) {
    const r = qr << Q_SHIFT;
    for (let qg = 0; qg < 1 << Q_BITS; qg++) {
      const g = qg << Q_SHIFT;
      for (let qb = 0; qb < 1 << Q_BITS; qb++) {
        const b = qb << Q_SHIFT;
        let best = 0;
        let bestDist = Infinity;
        for (let c = 0; c < n; c++) {
          const cr = colors[c][0];
          const cg = colors[c][1];
          const cb = colors[c][2];
          const dr = r - cr;
          const dg = g - cg;
          const db = b - cb;
          const d = dr * dr + dg * dg + db * db;
          if (d < bestDist) {
            bestDist = d;
            best = c;
          }
        }
        lut[(qr << (Q_BITS * 2)) | (qg << Q_BITS) | qb] = best;
      }
    }
  }

  const flatRgb = new Uint8Array(n * 3);
  for (let c = 0; c < n; c++) {
    flatRgb[c * 3] = colors[c][0];
    flatRgb[c * 3 + 1] = colors[c][1];
    flatRgb[c * 3 + 2] = colors[c][2];
  }

  return { colors, lut, flatRgb };
}

/** Nearest-palette-color lookup, with an ordered-dither offset baked in. */
export function lookupColor(
  lut: Uint8Array,
  r: number,
  g: number,
  b: number,
  dither: number
): number {
  let dr = r + dither;
  let dg = g + dither;
  let db = b + dither;
  if (dr < 0) dr = 0;
  else if (dr > 255) dr = 255;
  if (dg < 0) dg = 0;
  else if (dg > 255) dg = 255;
  if (db < 0) db = 0;
  else if (db > 255) db = 255;
  const qr = dr >> Q_SHIFT;
  const qg = dg >> Q_SHIFT;
  const qb = db >> Q_SHIFT;
  return lut[(qr << (Q_BITS * 2)) | (qg << Q_BITS) | qb];
}

/** Applies contrast/brightness (preserving hue) and optional invert. */
export function adjustPixel(
  r: number,
  g: number,
  b: number,
  contrast: number,
  brightness: number,
  invert: boolean,
  out: [number, number, number]
): void {
  const origL = 0.299 * r + 0.587 * g + 0.114 * b;
  const l = adjustColor(origL, contrast, brightness);
  const scale = origL > 0 ? l / origL : 1;
  let nr = r * scale;
  let ng = g * scale;
  let nb = b * scale;
  if (nr > 255) nr = 255;
  if (ng > 255) ng = 255;
  if (nb > 255) nb = 255;
  if (invert) {
    nr = 255 - nr;
    ng = 255 - ng;
    nb = 255 - nb;
  }
  out[0] = nr;
  out[1] = ng;
  out[2] = nb;
}

/** Paints one isometric-ish cube sprite (top/right/bottom faces + outline). */
export function paintCube(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  r: number,
  g: number,
  b: number
): void {
  const top = `rgb(${Math.min(255, r * 1.15 + 20) | 0},${Math.min(255, g * 1.15 + 20) | 0},${Math.min(255, b * 1.15 + 20) | 0})`;
  const right = `rgb(${(r * 0.72) | 0},${(g * 0.72) | 0},${(b * 0.72) | 0})`;
  const bottom = `rgb(${(r * 0.5) | 0},${(g * 0.5) | 0},${(b * 0.5) | 0})`;

  const depth = Math.max(1, size * 0.18);
  const topH = size - depth;

  ctx.fillStyle = top;
  ctx.fillRect(x, y, size - depth, topH);

  ctx.fillStyle = right;
  ctx.beginPath();
  ctx.moveTo(x + size - depth, y);
  ctx.lineTo(x + size, y + depth);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x + size - depth, y + size - depth);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = bottom;
  ctx.beginPath();
  ctx.moveTo(x, y + size - depth);
  ctx.lineTo(x + size - depth, y + size - depth);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x + depth, y + size);
  ctx.closePath();
  ctx.fill();

  if (size >= 6) {
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - depth - 1, topH - 1);
  }
}

/** Builds a sprite atlas: one pre-rendered cube per palette color. */
export function buildAtlas(
  size: number,
  colors: Array<[number, number, number]>
): Atlas {
  const sprite = Math.max(4, Math.round(size));
  const count = colors.length;
  const canvas = document.createElement("canvas");
  canvas.width = count * sprite;
  canvas.height = sprite;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("voxel: atlas ctx");
  for (let c = 0; c < count; c++) {
    const [r, g, b] = colors[c];
    paintCube(ctx, c * sprite, 0, sprite, r, g, b);
  }
  return { canvas, sprite, count };
}

/** Flat-path fill: writes quantized palette colors into an RGBA buffer. */
export function fillQuantized(
  out: Uint8ClampedArray,
  pixels: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  palette: Palette,
  contrast: number,
  brightness: number,
  invert: boolean
): void {
  const lut = palette.lut;
  const flat = palette.flatRgb;
  const ditherAmp = DITHER_STRENGTH / 15;
  const ditherHalf = DITHER_STRENGTH / 2;
  const tmp: [number, number, number] = [0, 0, 0];

  let p = 0;
  let o = 0;
  for (let y = 0; y < srcH; y++) {
    const bayerRow = (y & 3) << 2;
    for (let x = 0; x < srcW; x++, p += 4, o += 4) {
      adjustPixel(
        pixels[p],
        pixels[p + 1],
        pixels[p + 2],
        contrast,
        brightness,
        invert,
        tmp
      );
      const bayer = BAYER4[bayerRow + (x & 3)] * ditherAmp - ditherHalf;
      const idx = lookupColor(lut, tmp[0], tmp[1], tmp[2], bayer);
      out[o] = flat[idx * 3];
      out[o + 1] = flat[idx * 3 + 1];
      out[o + 2] = flat[idx * 3 + 2];
      out[o + 3] = 255;
    }
  }
}
