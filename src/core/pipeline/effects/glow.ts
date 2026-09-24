import type { GlowPassOptions } from "@/types";

let prepScratch: HTMLCanvasElement | null = null;
let blurScratch: HTMLCanvasElement | null = null;

function getPrepScratch(w: number, h: number): CanvasRenderingContext2D | null {
  if (!prepScratch) prepScratch = document.createElement("canvas");
  if (prepScratch.width !== w || prepScratch.height !== h) {
    prepScratch.width = w;
    prepScratch.height = h;
  }
  return prepScratch.getContext("2d");
}

function getBlurScratch(w: number, h: number): CanvasRenderingContext2D | null {
  if (!blurScratch) blurScratch = document.createElement("canvas");
  if (blurScratch.width !== w || blurScratch.height !== h) {
    blurScratch.width = w;
    blurScratch.height = h;
  }
  return blurScratch.getContext("2d");
}

function applyGlowPass(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  {
    blur,
    strength,
    brightness = 1.3,
    contrast,
    downsample = 0.5,
    tint,
  }: GlowPassOptions
) {
  const dilate = Math.max(2, Math.min(blur * 0.25, 6));
  const dctx = getPrepScratch(canvas.width, canvas.height);
  if (!dctx) return;

  dctx.filter = contrast
    ? `blur(${dilate}px) brightness(${brightness}) contrast(${contrast}%)`
    : `blur(${dilate}px) brightness(${brightness})`;
  dctx.globalCompositeOperation = "source-over";
  dctx.globalAlpha = 1;
  dctx.clearRect(0, 0, canvas.width, canvas.height);
  dctx.drawImage(canvas, 0, 0);

  if (tint) {
    dctx.filter = "none";
    dctx.globalCompositeOperation = "multiply";
    dctx.fillStyle = tint;
    dctx.fillRect(0, 0, canvas.width, canvas.height);
    dctx.globalCompositeOperation = "source-over";
  }

  const w = Math.max(1, Math.round(canvas.width * downsample));
  const h = Math.max(1, Math.round(canvas.height * downsample));
  const sctx = getBlurScratch(w, h);
  if (!sctx) return;

  sctx.filter = "none";
  sctx.globalCompositeOperation = "source-over";
  sctx.globalAlpha = 1;
  sctx.drawImage(prepScratch as HTMLCanvasElement, 0, 0, w, h);

  ctx.save();
  ctx.filter = `blur(${blur}px)`;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = strength;
  ctx.drawImage(
    blurScratch as HTMLCanvasElement,
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.restore();
}

export function applyGlow(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  intensity = 0.5
) {
  applyGlowPass(canvas, ctx, {
    blur: 6,
    strength: 0.25 * intensity,
    brightness: 1.15,
    downsample: 0.6,
  });
}

export function applyBloom(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  intensity = 0.6
) {
  applyGlowPass(canvas, ctx, {
    blur: 18,
    strength: 0.55 * intensity,
    brightness: 1.6,
    contrast: 220,
    downsample: 0.35,
  });
}

/** simulates film halation around highlights. */
export function applyHalation(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  intensity = 0.5,
  tint = "rgb(255, 90, 40)"
) {
  applyGlowPass(canvas, ctx, {
    blur: 24,
    strength: 0.45 * intensity,
    brightness: 1.4,
    contrast: 180,
    downsample: 0.3,
    tint,
  });
}
