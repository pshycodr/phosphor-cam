import { memo, useEffect, useRef, useState } from "react";

import { Eye, Maximize2, ZoomIn, ZoomOut } from "lucide-react";

import { useStudioStore } from "../store/studioStore";
import { StudioWorkerController } from "../worker/StudioWorkerController";

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
  const panStartRef = useRef<{
    x: number;
    y: number;
    initialPanX: number;
    initialPanY: number;
  } | null>(null);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);

  // Initialize OffscreenCanvas and background Web Worker controller
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const canvas = document.createElement("canvas");
    canvas.className = "rounded-sm shadow-2xl transition-opacity duration-150";
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
    mount.appendChild(canvas);

    try {
      const controller = new StudioWorkerController(canvas);
      controllerRef.current = controller;
      setWorkerController(controller);

      // Initialize current settings
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

  // Track container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        controllerRef.current?.resize(width, height);
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Send settings to the worker whenever they update
  useEffect(() => {
    controllerRef.current?.setSettings(settings);
  }, [settings]);

  // Decode and send new image bitmap to worker
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
        if (!active) {
          bitmap.close();
          return;
        }
        controllerRef.current?.setImage(bitmap);
      } catch (err) {
        console.error("createImageBitmap failed:", err);
      }
    };

    return () => {
      active = false;
    };
  }, [image?.url]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setZoom((prev) => Math.min(4, Math.max(0.5, prev + delta)));
  };

  // Mouse & Touch Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStartRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPan({
      x: panStartRef.current.initialPanX + dx,
      y: panStartRef.current.initialPanY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    panStartRef.current = null;
  };

  // Mobile pinch-to-zoom & pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistRef.current = Math.hypot(dx, dy);
      pinchStartZoomRef.current = zoom;
    } else if (e.touches.length === 1 && zoom > 1) {
      setIsPanning(true);
      panStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        initialPanX: pan.x,
        initialPanY: pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = dist / pinchStartDistRef.current;
      setZoom(Math.min(4, Math.max(0.5, pinchStartZoomRef.current * factor)));
    } else if (e.touches.length === 1 && isPanning && panStartRef.current) {
      const dx = e.touches[0].clientX - panStartRef.current.x;
      const dy = e.touches[0].clientY - panStartRef.current.y;
      setPan({
        x: panStartRef.current.initialPanX + dx,
        y: panStartRef.current.initialPanY + dy,
      });
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistRef.current = null;
    setIsPanning(false);
    panStartRef.current = null;
  };

  const handleDoubleClick = () => {
    if (zoom > 1) {
      resetZoomAndPan();
    } else {
      setZoom(2);
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
      className={`relative flex h-full w-full flex-1 items-center justify-center overflow-hidden bg-black select-none ${
        zoom > 1
          ? isPanning
            ? "cursor-grabbing"
            : "cursor-grab"
          : "cursor-default"
      }`}
    >
      {/* Canvas container with zoom & pan transforms */}
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

        {/* Original photo overlay when Compare is active */}
        {isComparing && image && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={image.url}
              alt="Original Unedited"
              className="max-h-full max-w-full rounded-sm object-contain"
            />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-zinc-700 bg-black/80 px-3 py-1 font-mono text-[11px] font-bold text-white shadow-lg backdrop-blur-md">
              <Eye size={13} className="text-amber-400" />
              <span>ORIGINAL PHOTO</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Lightroom-style minimal zoom bar */}
      <div className="pointer-events-auto absolute bottom-4 left-4 z-20 flex items-center gap-1 rounded-full border border-zinc-800/80 bg-zinc-950/80 p-1 text-xs text-zinc-300 shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          className="flex size-7 items-center justify-center rounded-full hover:bg-zinc-800 hover:text-white"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>

        <button
          type="button"
          onClick={resetZoomAndPan}
          className="px-2 font-mono text-[11px] font-bold tabular-nums hover:text-green-400"
          title="Reset zoom to fit"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
          className="flex size-7 items-center justify-center rounded-full hover:bg-zinc-800 hover:text-white"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>

        <div className="mx-0.5 h-3.5 w-px bg-zinc-800" />

        <button
          type="button"
          onClick={resetZoomAndPan}
          className="flex size-7 items-center justify-center rounded-full hover:bg-zinc-800 hover:text-white"
          title="Fit to Screen"
        >
          <Maximize2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default memo(StudioViewport);
