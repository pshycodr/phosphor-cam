import { memo, useEffect, useRef, useState } from "react";

import { ZoomIn, ZoomOut } from "lucide-react";

import { useStudioStore } from "../store/studioStore";
import { StudioWorkerController } from "../worker/StudioWorkerController";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

const touchDistance = (t: React.TouchList) =>
  Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

interface PanStart {
  x: number;
  y: number;
  panX: number;
  panY: number;
}

function StudioViewport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<StudioWorkerController | null>(null);

  const image = useStudioStore((s) => s.image);
  const settings = useStudioStore((s) => s.settings);
  const isComparing = useStudioStore((s) => s.isComparing);
  const zoom = useStudioStore((s) => s.zoom);
  const pan = useStudioStore((s) => s.pan);
  const setZoom = useStudioStore((s) => s.setZoom);
  const setPan = useStudioStore((s) => s.setPan);
  const resetZoomAndPan = useStudioStore((s) => s.resetZoomAndPan);
  const setWorkerController = useStudioStore((s) => s.setWorkerController);

  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<PanStart | null>(null);
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);

  // Create the canvas and its background worker
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const canvas = document.createElement("canvas");
    canvas.className = "rounded-sm shadow-2xl";
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
    mount.appendChild(canvas);

    try {
      const controller = new StudioWorkerController(canvas);
      controllerRef.current = controller;
      setWorkerController(controller);
      controller.setSettings(useStudioStore.getState().settings);
    } catch (err) {
      console.error("Failed to initialize StudioWorkerController:", err);
    }

    return () => {
      setWorkerController(null);
      controllerRef.current?.destroy();
      controllerRef.current = null;
      canvas.remove();
    };
  }, [setWorkerController]);

  // Keep the worker sized to the container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      controllerRef.current?.resize(width, height);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Push settings to the worker
  useEffect(() => {
    controllerRef.current?.setSettings(settings);
  }, [settings]);

  // Decode new images and hand the bitmap to the worker
  useEffect(() => {
    if (!image?.url) return;

    let active = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image.url;
    img.onload = async () => {
      if (!active) return;
      try {
        const bitmap = await createImageBitmap(img);
        if (active) controllerRef.current?.setImage(bitmap);
        else bitmap.close();
      } catch (err) {
        console.error("createImageBitmap failed:", err);
      }
    };

    return () => {
      active = false;
    };
  }, [image?.url]);

  const beginPan = (x: number, y: number) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    panStart.current = { x, y, panX: pan.x, panY: pan.y };
  };

  const movePan = (x: number, y: number) => {
    const start = panStart.current;
    if (!start) return;
    setPan({ x: start.panX + x - start.x, y: start.panY + y - start.y });
  };

  const endPan = () => {
    setIsPanning(false);
    panStart.current = null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStart.current = { dist: touchDistance(e.touches), zoom };
    } else if (e.touches.length === 1) {
      beginPan(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStart.current) {
      const { dist, zoom: startZoom } = pinchStart.current;
      setZoom(clampZoom(startZoom * (touchDistance(e.touches) / dist)));
    } else if (e.touches.length === 1) {
      movePan(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchEnd = () => {
    pinchStart.current = null;
    endPan();
  };

  const cursor =
    zoom > 1 ? (isPanning ? "cursor-grabbing" : "cursor-grab") : "";

  return (
    <div
      ref={containerRef}
      onWheel={(e) => setZoom((z) => clampZoom(z - e.deltaY * 0.0015))}
      onMouseDown={(e) => beginPan(e.clientX, e.clientY)}
      onMouseMove={(e) => movePan(e.clientX, e.clientY)}
      onMouseUp={endPan}
      onMouseLeave={endPan}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onDoubleClick={() => (zoom > 1 ? resetZoomAndPan() : setZoom(2))}
      className={`relative flex h-full w-full flex-1 items-center justify-center overflow-hidden bg-black select-none ${cursor}`}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isPanning ? "none" : "transform 0.15s ease-out",
        }}
        className="relative flex items-center justify-center"
      >
        <div
          ref={canvasMountRef}
          style={{ opacity: isComparing ? 0 : 1 }}
          className="contents"
        />

        {isComparing && image && (
          <img
            src={image.url}
            alt="Original"
            className="absolute inset-0 m-auto max-h-full max-w-full rounded-sm object-contain"
          />
        )}
      </div>

      {isComparing && (
        <span className="absolute top-3 left-3 font-mono text-[11px] text-zinc-400">
          ORIGINAL
        </span>
      )}

      <div className="absolute bottom-4 left-4 z-20 flex items-center rounded-lg bg-zinc-950/80 text-zinc-400">
        <button
          type="button"
          onClick={() => setZoom((z) => clampZoom(z - 0.25))}
          className="flex size-8 items-center justify-center rounded-lg hover:text-white"
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          type="button"
          onClick={resetZoomAndPan}
          className="w-12 text-center font-mono text-[11px] tabular-nums hover:text-white"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => clampZoom(z + 0.25))}
          className="flex size-8 items-center justify-center rounded-lg hover:text-white"
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
      </div>
    </div>
  );
}

export default memo(StudioViewport);
