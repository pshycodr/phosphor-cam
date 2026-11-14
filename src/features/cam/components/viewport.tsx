import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { useMediaQuery } from "@/shared/components/settings/common/useMediaQuery";

import { useCameraSource } from "../hooks/useCameraSource";
import { useSettingsStore } from "../store/settingsStore";
import { useStatsStore } from "../store/statsStore";
import type { AspectRatio } from "../types";
import { RenderWorkerController } from "../worker/Renderworkercontroller";

export interface ViewportHandle {
  captureImage: () => Promise<string>;
  getAsciiText: () => Promise<string>;
  getCanvas: () => HTMLCanvasElement | null;
}
interface ViewportProps {
  stream: MediaStream | null;
  canvasSize: { width: number; height: number };
  mirrored?: boolean;
  aspect?: AspectRatio;
  onStageSize?: (size: { width: number; height: number }) => void;
}

const RATIOS: Record<AspectRatio, number | null> = {
  square: 1,
  portrait: 3 / 4,
  full: null,
};

const Viewport = forwardRef<ViewportHandle, ViewportProps>(
  (
    { stream, canvasSize, mirrored = false, aspect = "full", onStageSize },
    ref
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const controllerRef = useRef<RenderWorkerController | null>(null);
    const [stageSize, setStageSize] = useState(canvasSize);
    const isMobile = useMediaQuery("(max-width: 639px)");

    const source = useCameraSource(stream, videoRef);

    const sourceRef = useRef(source);

    const sizeRef = useRef(canvasSize);
    useEffect(() => {
      sourceRef.current = source;
    }, [source]);

    useEffect(() => {
      sizeRef.current = stageSize;
    }, [stageSize]);

    useEffect(() => {
      onStageSize?.(stageSize);
    }, [onStageSize, stageSize]);

    useEffect(() => {
      const wrapper = wrapperRef.current;

      if (!wrapper) return;

      const ratio = isMobile ? RATIOS[aspect] : null;

      const update = () => {
        const rect = wrapper.getBoundingClientRect();

        if (rect.width < 2 || rect.height < 2) return;

        let width = rect.width;
        let height = rect.height;

        if (ratio) {
          width = Math.min(rect.width, rect.height * ratio);
          height = width / ratio;
        }

        const next = { width: Math.round(width), height: Math.round(height) };
        setStageSize((prev) =>
          prev.width === next.width && prev.height === next.height ? prev : next
        );
      };

      update();
      const observer = new ResizeObserver(update);
      observer.observe(wrapper);
      return () => observer.disconnect();
    }, [aspect, isMobile]);

    useEffect(() => {
      const container = containerRef.current;

      if (!container) return;

      const canvas = document.createElement("canvas");
      canvas.width = sizeRef.current.width;
      canvas.height = sizeRef.current.height;
      canvas.className = "h-full w-full";
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", "Live Phosphor camera preview");
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
    }, []);

    useEffect(() => {
      controllerRef.current?.resize(stageSize.width, stageSize.height);
    }, [stageSize.width, stageSize.height]);

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
      <div
        ref={wrapperRef}
        className="fixed inset-0 flex items-center justify-center overflow-hidden bg-ink max-sm:top-[calc(env(safe-area-inset-top)+7rem)] max-sm:right-[max(0.5rem,env(safe-area-inset-right))] max-sm:bottom-[calc(env(safe-area-inset-bottom)+12rem)] max-sm:left-[max(0.5rem,env(safe-area-inset-left))] max-sm:bg-transparent"
      >
        <div
          ref={stageRef}
          className="frame-in relative flex items-center justify-center overflow-hidden bg-ink max-sm:rounded-[26px] max-sm:border max-sm:border-signal/15 max-sm:shadow-[0_0_50px_-18px_rgba(56,243,112,0.45)]"
          style={{
            width: stageSize.width,
            height: stageSize.height,
            transform: mirrored ? "scaleX(-1)" : undefined,
          }}
        >
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
      </div>
    );
  }
);

Viewport.displayName = "Viewport";

export default Viewport;
