import type { RefObject } from "react";
import { useEffect } from "react";

import type { FrameSource } from "@/types";

export function useCameraSource(
  stream: MediaStream | null,
  videoRef: RefObject<HTMLVideoElement | null>
): FrameSource {
  useEffect(() => {
    const video = videoRef.current;

    if (!video || !stream) return;

    video.srcObject = stream;

    video.play().catch(() => {});
  }, [stream, videoRef]);

  return {
    isReady: () => !!videoRef.current && videoRef.current.readyState === 4,

    getFrame: () => {
      const video = videoRef.current;

      return video && video.readyState === 4 ? video : null;
    },
  };
}
