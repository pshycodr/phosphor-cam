let caSourceScratch: OffscreenCanvas | null = null;
let caChannelScratch: OffscreenCanvas | null = null;

function getCaSourceScratch(
  w: number,
  h: number
): OffscreenCanvasRenderingContext2D | null {
  if (!caSourceScratch) caSourceScratch = new OffscreenCanvas(w, h);
  if (caSourceScratch.width !== w || caSourceScratch.height !== h) {
    caSourceScratch.width = w;
    caSourceScratch.height = h;
  }
  return caSourceScratch.getContext("2d");
}

function getCaChannelScratch(
  w: number,
  h: number
): OffscreenCanvasRenderingContext2D | null {
  if (!caChannelScratch) caChannelScratch = new OffscreenCanvas(w, h);
  if (caChannelScratch.width !== w || caChannelScratch.height !== h) {
    caChannelScratch.width = w;
    caChannelScratch.height = h;
  }
  return caChannelScratch.getContext("2d");
}

function drawTintedChannel(
  ctx: OffscreenCanvasRenderingContext2D,
  source: OffscreenCanvas,
  tint: string,
  dx: number,
  dy: number
) {
  const w = source.width;
  const h = source.height;
  const cctx = getCaChannelScratch(w, h);
  if (!cctx) return;

  cctx.filter = "none";
  cctx.globalCompositeOperation = "source-over";
  cctx.globalAlpha = 1;
  cctx.drawImage(source, 0, 0);
  cctx.globalCompositeOperation = "multiply";
  cctx.fillStyle = tint;
  cctx.fillRect(0, 0, w, h);

  ctx.drawImage(caChannelScratch as OffscreenCanvas, dx, dy);
}

export function applyChromaticAberration(
  canvas: OffscreenCanvas,
  ctx: OffscreenCanvasRenderingContext2D,
  intensity = 0.5
) {
  const offset = Math.round(intensity * 8);
  if (offset <= 0) return;

  const sctx = getCaSourceScratch(canvas.width, canvas.height);
  if (!sctx) return;
  sctx.filter = "none";
  sctx.globalCompositeOperation = "source-over";
  sctx.globalAlpha = 1;
  sctx.drawImage(canvas, 0, 0);

  ctx.save();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "lighter";
  const source = caSourceScratch as OffscreenCanvas;
  drawTintedChannel(ctx, source, "rgb(255, 0, 0)", -offset, 0);
  drawTintedChannel(ctx, source, "rgb(0, 255, 0)", 0, 0);
  drawTintedChannel(ctx, source, "rgb(0, 0, 255)", offset, 0);
  ctx.restore();
}
