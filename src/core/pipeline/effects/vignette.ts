let vignetteCache: { key: string; gradient: CanvasGradient } | null = null;

function getVignetteGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  strength: number
): CanvasGradient {
  const key = `${w}x${h}@${strength.toFixed(3)}`;
  if (vignetteCache && vignetteCache.key === key) return vignetteCache.gradient;

  const cx = w / 2;
  const cy = h / 2;
  const outerR = Math.sqrt(cx * cx + cy * cy);
  const gradient = ctx.createRadialGradient(
    cx,
    cy,
    outerR * 0.5,
    cx,
    cy,
    outerR
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, `rgba(0, 0, 0, ${strength})`);

  vignetteCache = { key, gradient };
  return gradient;
}

export function applyVignette(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  intensity = 0.5
) {
  const strength = 0.15 + intensity * 0.55;
  const gradient = getVignetteGradient(
    ctx,
    canvas.width,
    canvas.height,
    strength
  );

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
