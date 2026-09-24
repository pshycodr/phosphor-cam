let scanlinePattern: CanvasPattern | null = null;
let scanlinePatternKey = "";

function getScanlinePattern(
  ctx: CanvasRenderingContext2D,
  spacing: number,
  alpha: number
): CanvasPattern | null {
  const key = `${spacing}@${alpha.toFixed(3)}`;
  if (scanlinePattern && scanlinePatternKey === key) return scanlinePattern;

  const tile = document.createElement("canvas");
  tile.width = 1;
  tile.height = spacing;
  const tctx = tile.getContext("2d");
  if (!tctx) return null;
  tctx.clearRect(0, 0, 1, spacing);
  tctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  tctx.fillRect(0, 0, 1, 1);

  scanlinePattern = ctx.createPattern(tile, "repeat");
  scanlinePatternKey = key;
  return scanlinePattern;
}

export function applyScanlines(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  intensity = 0.5
) {
  const pattern = getScanlinePattern(ctx, 3, 0.5 * intensity);
  if (!pattern) return;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
