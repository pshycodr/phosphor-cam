import { useEffect, useRef } from "react";

import { downsampleFrame } from "@/core/pipeline/downsample";
import { runEffectPipeline } from "@/core/pipeline/effects";
import { useSettingsStore } from "@/store/settingsStore";
import { useStatsStore } from "@/store/statsStore";
import type { FrameSource, RendererInstance } from "@/types";

interface UseFrameLoopArgs {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  rendererRef: React.RefObject<RendererInstance | null>;
  source: FrameSource;
  canvasSize: { width: number; height: number };
}

export function useFrameLoop({
  canvasRef,
  rendererRef,
  source,
  canvasSize,
}: UseFrameLoopArgs) {
  const scratchRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    if (!scratchRef.current) {
      scratchRef.current = document.createElement("canvas");
    }

    const tick = (time: number) => {
      rafRef.current = requestAnimationFrame(tick);

      const canvas = canvasRef.current;
      const renderer = rendererRef.current;
      const scratch = scratchRef.current;
      if (!canvas || !renderer || !scratch || !source.isReady()) return;

      const frame = source.getFrame();
      if (!frame) return;

      const start = performance.now();
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const { settings } = useSettingsStore.getState();
      const cellSize = settings.fontSize || 10;

      const srcW = Math.floor(canvasSize.width / cellSize);
      const srcH = Math.floor(canvasSize.height / cellSize);
      if (srcW <= 0 || srcH <= 0) return;

      const imageData = downsampleFrame(frame, srcW, srcH, scratch);
      if (!imageData) return;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      renderer.render(imageData, ctx, settings, cellSize);

      runEffectPipeline(canvas, ctx, settings);

      const renderTime = performance.now() - start;

      if (Math.random() > 0.95) {
        useStatsStore.getState().setStats({ fps: 1000 / delta, renderTime });
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef, rendererRef, source, canvasSize.width, canvasSize.height]);
}
