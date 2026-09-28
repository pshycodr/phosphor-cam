import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { useCameraSource } from "@/hooks/useCameraSource";
import { useSettingsStore } from "@/store/settingsStore";
import { useStatsStore } from "@/store/statsStore";
import { RenderWorkerController } from "@/worker/Renderworkercontroller";

export interface ViewportHandle {
  captureImage: () => Promise<string>;
  getAsciiText: () => Promise<string>;
  getCanvas: () => HTMLCanvasElement | null;
}

interface ViewportProps {
  stream: MediaStream | null;
  canvasSize: { width: number; height: number };
}

const Viewport = forwardRef<ViewportHandle, ViewportProps>(
  ({ stream, canvasSize }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const controllerRef = useRef<RenderWorkerController | null>(null);

    const source = useCameraSource(stream, videoRef);

    const sourceRef = useRef(source);

    const sizeRef = useRef(canvasSize);
    useEffect(() => {
      sourceRef.current = source;
    }, [source]);

    useEffect(() => {
      sizeRef.current = canvasSize;
    }, [canvasSize]);

    useEffect(() => {
      const container = containerRef.current;

      if (!container) return;

      const canvas = document.createElement("canvas");
      canvas.width = sizeRef.current.width;
      canvas.height = sizeRef.current.height;
      canvas.className = "-z-10 max-h-full max-w-full bg-transparent";
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", "Live ASCII camera preview");
      container.appendChild(canvas);
      canvasRef.current = canvas;

      const controller = new RenderWorkerController(canvas, {
        onStats: (s) => useStatsStore.getState().setStats(s),
      });
      controllerRef.current = controller;

      controller.resize(sizeRef.current.width, sizeRef.current.height);
      controller.setSettings(useSettingsStore.getState().settings);
      const unsubscribe = useSettingsStore.subscribe((state) => {
        controller.setSettings(state.settings);
      });

      return () => {
        unsubscribe();
        controller.destroy();
        controllerRef.current = null;
        canvas.remove();
        canvasRef.current = null;
      };
    }, [canvasSize]);

    useEffect(() => {
      controllerRef.current?.resize(canvasSize.width, canvasSize.height);
    }, [canvasSize.width, canvasSize.height]);

    useEffect(() => {
      let raf = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);

        const controller = controllerRef.current;
        const src = sourceRef.current;

        if (!controller || !src.isReady()) return;

        const frame = src.getFrame();

        if (frame) controller.sendFrame(frame);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [source]);

    useImperativeHandle(
      ref,
      () => ({
        getCanvas: () => canvasRef.current,

        captureImage: async () => {
          const controller = controllerRef.current;
          const frame = sourceRef.current.getFrame();
          if (!controller || !frame)
            throw new Error("Capture not available yet");
          return controller.captureImage(frame, sizeRef.current);
        },

        getAsciiText: async () => {
          const controller = controllerRef.current;
          const frame = sourceRef.current.getFrame();
          if (!controller || !frame) return "";
          return controller.getAsciiText(frame);
        },
      }),
      []
    );

    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black">
        <video
          ref={videoRef}
          style={{ display: "none" }}
          playsInline
          muted
          aria-hidden="true"
        />
        {/* Canvas is injected by the effect above */}
        <div ref={containerRef} className="contents" />
      </div>
    );
  }
);

Viewport.displayName = "Viewport";

export default Viewport;
