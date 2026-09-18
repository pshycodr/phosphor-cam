export function downsampleFrame(
  frame: CanvasImageSource,
  targetWidth: number,
  targetHeight: number,
  scratch: HTMLCanvasElement
): ImageData | null {
  if (targetWidth <= 0 || targetHeight <= 0) return null;

  if (scratch.width !== targetWidth || scratch.height !== targetHeight) {
    scratch.width = targetWidth;
    scratch.height = targetHeight;
  }

  const ctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  try {
    ctx.drawImage(frame, 0, 0, targetWidth, targetHeight);
  } catch {
    return null;
  }

  return ctx.getImageData(0, 0, targetWidth, targetHeight);
}
