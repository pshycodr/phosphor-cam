import type { Size } from "@/shared/types";

/** Largest edge a Studio source image may keep before it is downscaled. */
const MAX_SOURCE_EDGE = 1600;

/** Never shrink below this budget, even on an unusually small viewport. */
const MIN_SOURCE_PIXELS = 640 * 480;

/**
 * Live Cam renders and captures at the viewport size, so its 6x export starts
 * from a modest canvas. Studio used to keep the uploaded photo at full
 * resolution, which turned a 6x export of a phone photo into a canvas tens of
 * thousands of pixels wide and froze the device.
 *
 * Bound the working source to roughly one live-camera frame (same pixel
 * budget, capped long edge). Previews, the worker bitmap, and exports then all
 * process the same low-resolution source.
 */
export function getStudioSourceSize(width: number, height: number): Size {
  if (width <= 0 || height <= 0) return { width: 1, height: 1 };

  const viewportPixels =
    typeof window === "undefined"
      ? MIN_SOURCE_PIXELS
      : Math.max(MIN_SOURCE_PIXELS, window.innerWidth * window.innerHeight);

  const pixelScale = Math.sqrt(viewportPixels / (width * height));
  const edgeScale = MAX_SOURCE_EDGE / Math.max(width, height);
  const scale = Math.min(1, pixelScale, edgeScale);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export interface StudioImageSource {
  /** Blob URL when the image was downscaled, otherwise the source URL. */
  url: string;
  width: number;
  height: number;
}

/**
 * Decode an upload (or demo asset) and downscale it to the Studio working
 * size. The returned URL is safe to keep in the store; `clearImage` revokes
 * blob URLs.
 */
export async function loadBoundedStudioImage(
  source: File | string
): Promise<StudioImageSource> {
  const isFile = typeof source !== "string";
  const sourceUrl = isFile ? URL.createObjectURL(source) : source;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = sourceUrl;

  try {
    await img.decode();
  } catch (err) {
    if (isFile) URL.revokeObjectURL(sourceUrl);
    throw err;
  }

  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;
  const target = getStudioSourceSize(naturalWidth, naturalHeight);

  if (target.width === naturalWidth && target.height === naturalHeight) {
    return { url: sourceUrl, width: naturalWidth, height: naturalHeight };
  }

  const canvas = new OffscreenCanvas(target.width, target.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    if (isFile) URL.revokeObjectURL(sourceUrl);
    throw new Error("Could not create a canvas for image downscaling.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, target.width, target.height);

  const blob = await canvas.convertToBlob({
    type: "image/webp",
    quality: 0.92,
  });

  if (isFile) URL.revokeObjectURL(sourceUrl);

  return {
    url: URL.createObjectURL(blob),
    width: target.width,
    height: target.height,
  };
}
