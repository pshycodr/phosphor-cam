import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useMediaQuery } from "@/shared/components/settings/common/useMediaQuery";

import { useCameraSource } from "../hooks/useCameraSource";
import { useViewfinderGestures } from "../hooks/useViewfinderGestures";
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
  onFlip?: () => void;
  gesturesDisabled?: boolean;
  onStageSize?: (size: { width: number; height: number }) => void;
}

/** null means "fill whatever space the frame was given". */
const RATIOS: Record<AspectRatio, number | null> = {
  "1:1": 1,
  "3:4": 3 / 4,
  full: null,
};

const ASPECT_ORDER: readonly AspectRatio[] = ["1:1", "3:4", "full"];

const Viewport = forwardRef<ViewportHandle, ViewportProps>(
  (
    {
      stream,
      canvasSize,
      mirrored = false,
      onFlip,
      gesturesDisabled = false,
      onStageSize,
    },
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
    const isLandscape = useMediaQuery("(orientation: landscape)");
    const aspect = useSettingsStore((s) => s.settings.aspectRatio);
    // A rotated phone has no vertical room for an inset card, so the frame
    // takes the whole screen there and the chrome overlays it.
    const fillScreen = !isMobile || aspect === "full" || isLandscape;

    const cycleAspect = useCallback((direction: 1 | -1) => {
      const { settings, updateSettings } = useSettingsStore.getState();
      const index = ASPECT_ORDER.indexOf(settings.aspectRatio);
      const next =
        ASPECT_ORDER[
          (index + direction + ASPECT_ORDER.length) % ASPECT_ORDER.length
        ];
      updateSettings({ aspectRatio: next });
    }, []);

    const gestures = useViewfinderGestures({
      onFlip: onFlip ?? (() => {}),
      onCycleAspect: cycleAspect,
      enabled: isMobile && !gesturesDisabled && !!onFlip,
    });

    const box = useMemo(
      () => ({
        width: stageSize.width,
        height: stageSize.height,
        mirrored,
      }),
      [stageSize.width, stageSize.height, mirrored]
    );

    const source = useCameraSource(stream, videoRef, box);

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

    useLayoutEffect(() => {
      const wrapper = wrapperRef.current;

      if (!wrapper) return;

      const ratio = isMobile ? RATIOS[aspect] : null;

      const update = () => {
        const rect = wrapper.getBoundingClientRect();

        if (rect.width < 2 || rect.height < 2) return;

        let width = rect.width;
        let height = rect.height;

        if (ratio) {
          // Fit the ratio inside the available box, shrinking both sides.
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
      window.addEventListener("orientationchange", update);

      return () => {
        observer.disconnect();
        window.removeEventListener("orientationchange", update);
      };
    }, [aspect, isMobile]);

    useEffect(() => {
      const container = containerRef.current;

      if (!container) return;

      const canvas = document.createElement("canvas");
      canvas.width = sizeRef.current.width;
      canvas.height = sizeRef.current.height;
      canvas.className = "h-full w-full object-cover";
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

        if (!controller || !controller.isIdle() || !src.isReady()) return;

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
        {...gestures}
        className={
          fillScreen
            ? "fixed inset-0 flex touch-pan-y items-center justify-center overflow-hidden bg-ink"
            : "fixed inset-0 flex touch-pan-y items-center justify-center overflow-hidden bg-ink max-sm:top-[calc(env(safe-area-inset-top)+7rem)] max-sm:right-[max(0.5rem,env(safe-area-inset-right))] max-sm:bottom-[calc(env(safe-area-inset-bottom)+12rem)] max-sm:left-[max(0.5rem,env(safe-area-inset-left))] max-sm:bg-transparent"
        }
        style={
          fillScreen && isMobile
            ? { width: "100vw", height: "100dvh" }
            : undefined
        }
      >
        <div
          ref={stageRef}
          className={`ratio-tween frame-in relative flex items-center justify-center overflow-hidden bg-ink motion-reduce:transition-none ${
            fillScreen
              ? ""
              : "max-sm:rounded-[26px] max-sm:border max-sm:border-signal/15 max-sm:shadow-[0_0_50px_-18px_rgba(56,243,112,0.45)]"
          }`}
          style={{
            width: stageSize.width,
            height: stageSize.height,
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
