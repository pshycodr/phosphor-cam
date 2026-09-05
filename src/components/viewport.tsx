import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { RENDERERS } from "@/core/renderers/registry";
import { useCameraSource } from "@/hooks/useCameraSource";
import { useFrameLoop } from "@/hooks/useFrameLoop";
import { useSettingsStore } from "@/store/settingsStore";
import type { RendererInstance } from "@/types";

export interface ViewportHandle {
  captureImage: () => Promise<string>;
  getAsciiText: () => string;
  getCanvas: () => HTMLCanvasElement | null;
}

interface ViewportProps {
  stream: MediaStream | null;
  canvasSize: { width: number; height: number };
}

const Viewport = forwardRef<ViewportHandle, ViewportProps>(
  ({ stream, canvasSize }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const rendererRef = useRef<RendererInstance | null>(null);

    const renderMode = useSettingsStore((s) => s.settings.renderMode);
    const source = useCameraSource(stream, videoRef);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      rendererRef.current = RENDERERS[renderMode](canvas);

      return () => {
        rendererRef.current?.destroy?.();
        rendererRef.current = null;
      };
    }, [renderMode]);

    useFrameLoop({ canvasRef, rendererRef, source, canvasSize });

    useImperativeHandle(
      ref,
      () => ({
        getCanvas: () => canvasRef.current,

        captureImage: async () => {
          const renderer = rendererRef.current;
          const frame = source.getFrame();
          if (!renderer?.captureImage || !frame) {
            throw new Error("Capture not supported for this renderer");
          }
          return renderer.captureImage(
            frame,
            useSettingsStore.getState().settings,
            canvasSize
          );
        },

        getAsciiText: () => {
          const renderer = rendererRef.current;
          const frame = source.getFrame();
          if (!renderer?.getAsciiText || !frame) return "";
          return renderer.getAsciiText(
            frame,
            useSettingsStore.getState().settings
          );
        },
      }),
      [source, canvasSize]
    );

    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <video ref={videoRef} style={{ display: "none" }} playsInline muted />
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="-z-10 bg-transparent"
        />
      </div>
    );
  }
);

export default Viewport;
