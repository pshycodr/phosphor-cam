import { memo, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import {
  Clipboard,
  Film,
  Image as ImageIcon,
  Sparkles,
  Upload,
} from "lucide-react";

import { useStudioStore } from "../store/studioStore";

interface StudioEmptyStateProps {
  onOpenFilePicker: () => void;
  onFileSelected: (file: File) => void;
}

// Built-in sample images to test immediately without having a local file
const SAMPLE_PREVIEWS = [
  {
    id: "banner",
    title: "Synth Banner",
    category: "Wide Landscape",
    url: "/assets/banner.png",
  },
  {
    id: "logo",
    title: "Phosphor Icon",
    category: "High Contrast",
    url: "/assets/icon-foreground.png",
  },
  {
    id: "badge",
    title: "Terminal Badge",
    category: "Pixel Graphic",
    url: "/assets/icon-only.png",
  },
];

function StudioEmptyState({
  onOpenFilePicker,
  onFileSelected,
}: StudioEmptyStateProps) {
  const [isDragging, setIsDragging] = useState(false);
  const loadImage = useStudioStore((s) => s.loadImage);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("video/")) {
          toast(
            "Video editing is coming soon in the next update! Please select an image for now.",
            { icon: "🎬", duration: 4000 }
          );
          return;
        }
        if (file.type.startsWith("image/")) {
          onFileSelected(file);
        } else {
          toast.error("Please drop an image file (PNG, JPG, WebP, etc.)");
        }
      }
    },
    [onFileSelected]
  );

  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `pasted-image-${Date.now()}.png`, {
            type: imageType,
          });
          onFileSelected(file);
          toast.success("Image pasted from clipboard!");
          return;
        }
      }
      toast.error("No image found in clipboard");
    } catch {
      toast.error("Clipboard access was denied or not supported");
    }
  }, [onFileSelected]);

  // Window paste listener
  useEffect(() => {
    const onWindowPaste = (e: ClipboardEvent) => {
      const file = e.clipboardData?.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelected(file);
        toast.success("Image pasted from clipboard!");
      }
    };
    window.addEventListener("paste", onWindowPaste);
    return () => window.removeEventListener("paste", onWindowPaste);
  }, [onFileSelected]);

  const loadSample = useCallback(
    async (url: string, title: string) => {
      try {
        const img = new Image();
        img.src = url;
        await img.decode();
        loadImage(
          null,
          url,
          `${title}.png`,
          img.naturalWidth,
          img.naturalHeight
        );
        toast.success(`Loaded ${title}`);
      } catch (err) {
        console.error("Failed to load sample image", err);
        toast.error("Could not load sample image");
      }
    },
    [loadImage]
  );

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-y-auto px-4 py-8 transition-colors select-none ${
        isDragging
          ? "border-2 border-dashed border-green-400 bg-green-950/20"
          : "bg-black"
      }`}
    >
      <div className="flex max-w-xl flex-col items-center text-center">
        {/* Glow icon */}
        <div className="relative mb-6 flex size-20 items-center justify-center rounded-2xl border border-green-500/40 bg-zinc-950 shadow-xl shadow-green-500/10">
          <div className="absolute inset-0 rounded-2xl bg-green-500/10 blur-md" />
          <ImageIcon size={38} className="relative z-10 text-green-400" />
        </div>

        <h2 className="mb-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
          Phosphor <span className="text-green-400">Studio</span>
        </h2>

        <p className="mb-6 max-w-md text-sm text-zinc-400">
          Drop any photo here to transform it with ASCII, Dithering, Halftone,
          Lines, and 3D Voxel rendering engines with authentic CRT phosphor
          effects.
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpenFilePicker}
            className="flex items-center gap-2 rounded-xl border border-green-400 bg-green-500 px-5 py-3 text-sm font-bold text-black shadow-lg shadow-green-950/40 transition-all hover:bg-green-400 focus-visible:ring-2 focus-visible:ring-green-400/80 focus-visible:outline-none active:scale-95"
          >
            <Upload size={18} strokeWidth={2.5} />
            <span>Select Photo or Video</span>
          </button>

          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white focus-visible:ring-2 focus-visible:ring-green-400/80 focus-visible:outline-none"
          >
            <Clipboard size={17} />
            <span>Paste (Ctrl+V)</span>
          </button>
        </div>

        {/* Video notice */}
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-1.5 text-xs text-zinc-400">
          <Film size={14} className="text-amber-400" />
          <span>
            Image editing is live. Video editing is scheduled for the next
            release.
          </span>
        </div>

        {/* Or test with samples */}
        <div className="mt-10 w-full border-t border-zinc-900 pt-8">
          <div className="mb-4 flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider text-zinc-400 uppercase">
            <Sparkles size={14} className="text-green-400" />
            <span>Or try with demo images</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SAMPLE_PREVIEWS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSample(sample.url, sample.title)}
                className="group flex flex-col items-center rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3 text-left transition-all hover:border-green-500/50 hover:bg-zinc-900/60 focus-visible:ring-2 focus-visible:ring-green-400/80 focus-visible:outline-none"
              >
                <div className="mb-2 flex h-24 w-full items-center justify-center overflow-hidden rounded-lg bg-black/60 p-2">
                  <img
                    src={sample.url}
                    alt={sample.title}
                    className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                  />
                </div>
                <span className="text-xs font-bold text-zinc-200 group-hover:text-green-400">
                  {sample.title}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {sample.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(StudioEmptyState);
