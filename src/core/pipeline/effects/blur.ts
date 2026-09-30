let blurCopyScratch: OffscreenCanvas | null = null;

function getBlurCopyScratch(
  w: number,
  h: number
): OffscreenCanvasRenderingContext2D | null {
  if (!blurCopyScratch) blurCopyScratch = new OffscreenCanvas(w, h);
  if (blurCopyScratch.width !== w || blurCopyScratch.height !== h) {
    blurCopyScratch.width = w;
    blurCopyScratch.height = h;
  }
  return blurCopyScratch.getContext("2d");
}

/** Uniform softening across the whole frame - unlike glow/bloom, this
 *  replaces the frame rather than adding light on top of it. */
export function applyBlur(
  canvas: OffscreenCanvas,
  ctx: OffscreenCanvasRenderingContext2D,
  intensity = 0.5
) {
  const radius = intensity * 10;
  if (radius <= 0) return;

  const sctx = getBlurCopyScratch(canvas.width, canvas.height);
  if (!sctx) return;
  sctx.filter = "none";
  sctx.globalCompositeOperation = "source-over";
  sctx.globalAlpha = 1;
  sctx.clearRect(0, 0, canvas.width, canvas.height);
  sctx.drawImage(canvas, 0, 0);

  ctx.save();
  ctx.filter = `blur(${radius}px)`;
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.drawImage(blurCopyScratch as OffscreenCanvas, 0, 0);
  ctx.restore();
}
