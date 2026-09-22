import { adjustColor } from "./asciiUtils";

export const traceSmoothPath = (
  ctx: CanvasRenderingContext2D,
  xs: number[],
  ys: number[],
  startNew: boolean
) => {
  const n = xs.length;
  if (n === 0) return;
  if (startNew) ctx.moveTo(xs[0], ys[0]);
  else ctx.lineTo(xs[0], ys[0]);
  if (n === 1) return;

  for (let i = 0; i < n - 1; i++) {
    const p0x = xs[i === 0 ? 0 : i - 1];
    const p0y = ys[i === 0 ? 0 : i - 1];
    const p1x = xs[i];
    const p1y = ys[i];
    const p2x = xs[i + 1];
    const p2y = ys[i + 1];
    const p3x = xs[i + 2 >= n ? n - 1 : i + 2];
    const p3y = ys[i + 2 >= n ? n - 1 : i + 2];

    const c1x = p1x + (p2x - p0x) / 6;
    const c1y = p1y + (p2y - p0y) / 6;
    const c2x = p2x - (p3x - p1x) / 6;
    const c2y = p2y - (p3y - p1y) / 6;
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2x, p2y);
  }
};

export const sample = (
  pixels: Uint8ClampedArray,
  gridW: number,
  gx: number,
  gy: number,
  contrast: number,
  brightness: number,
  invert: boolean,
  minThickness: number,
  maxThickness: number
) => {
  const p = (gy * gridW + gx) * 4;
  const r0 = pixels[p];
  const g0 = pixels[p + 1];
  const b0 = pixels[p + 2];

  const origL = 0.299 * r0 + 0.587 * g0 + 0.114 * b0;
  const l = adjustColor(origL, contrast, brightness);
  const scale = origL > 0 ? l / origL : 1;

  let r = r0 * scale;
  let g = g0 * scale;
  let b = b0 * scale;
  if (r > 255) r = 255;
  if (g > 255) g = 255;
  if (b > 255) b = 255;

  let lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (invert) {
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
    lum = 255 - lum;
  }
  const t = lum / 255;
  return {
    r,
    g,
    b,
    thickness: minThickness + (maxThickness - minThickness) * t,
  };
};
