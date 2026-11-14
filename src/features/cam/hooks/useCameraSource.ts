import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";

import type { FrameSource } from "../types";

export interface FrameBox {
  /** Target frame size in CSS pixels. */
  width: number;
  height: number;
  mirrored: boolean;
}

/** Same math as CSS `object-fit: cover`: the source rect that fills the target. */
export function coverCrop(
  vw: number,
  vh: number,
  targetW: number,
  targetH: number
) {
  const targetRatio = targetW / targetH;
  const videoRatio = vw / vh;
  let sw = vw;
  let sh = vh;

  if (videoRatio > targetRatio) {
    sw = vh * targetRatio;
  } else {
    sh = vw / targetRatio;
  }

  return { sx: (vw - sw) / 2, sy: (vh - sh) / 2, sw, sh };
}

const MAX_PIXEL_SCALE = 2;
const MAX_PIXELS = 1_200_000;

/**
 * Streams the camera into a center-cropped canvas, so every renderer, capture
 * and recording sees the same frame the viewport shows.
 */
export function useCameraSource(
  stream: MediaStream | null,
  videoRef: RefObject<HTMLVideoElement | null>,
  box: FrameBox
): FrameSource {
  const boxRef = useRef(box);
  const cropRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    boxRef.current = box;
  }, [box]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !stream) return;

    video.srcObject = stream;

    video.play().catch(() => {});
  }, [stream, videoRef]);

  return useMemo(() => {
    const drawCropped = () => {
      const video = videoRef.current;
      const { width, height, mirrored } = boxRef.current;

      if (
        !video ||
        video.readyState < 2 ||
        !video.videoWidth ||
        width < 1 ||
        height < 1
      ) {
        return null;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_SCALE);
      const area = width * height;
      const scale =
        area * dpr * dpr > MAX_PIXELS ? Math.sqrt(MAX_PIXELS / area) : dpr;
      const outW = Math.max(1, Math.round(width * scale));
      const outH = Math.max(1, Math.round(height * scale));

      let canvas = cropRef.current;

      if (!canvas) {
        canvas = document.createElement("canvas");
        cropRef.current = canvas;
      }

      if (canvas.width !== outW || canvas.height !== outH) {
        canvas.width = outW;
        canvas.height = outH;
      }

      const ctx = canvas.getContext("2d", { alpha: false });

      if (!ctx) return null;

      const { sx, sy, sw, sh } = coverCrop(
        video.videoWidth,
        video.videoHeight,
        outW,
        outH
      );

      // Crop first, then mirror, so the crop stays centered.
      ctx.save();
      if (mirrored) {
        ctx.translate(outW, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
      ctx.restore();

      return canvas;
    };

    return {
      isReady: () => {
        const video = videoRef.current;
        return !!video && video.readyState === 4;
      },
      getFrame: drawCropped,
    };
  }, [videoRef]);
}
