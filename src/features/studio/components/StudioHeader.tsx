import { memo, useCallback, useEffect } from "react";
import { Link } from "react-router";

import {
  ChevronLeft,
  Download,
  Eye,
  Image as ImageIcon,
  Redo2,
  RotateCcw,
  Undo2,
  UploadCloud,
} from "lucide-react";

import { useStudioStore } from "../store/studioStore";

interface StudioHeaderProps {
  onOpenFilePicker: () => void;
}

function StudioHeader({ onOpenFilePicker }: StudioHeaderProps) {
  const image = useStudioStore((s) => s.image);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const resetSettings = useStudioStore((s) => s.resetSettings);
  const isComparing = useStudioStore((s) => s.isComparing);
  const setIsComparing = useStudioStore((s) => s.setIsComparing);
  const setIsExportModalOpen = useStudioStore((s) => s.setIsExportModalOpen);
  const historyIndex = useStudioStore((s) => s.historyIndex);
  const historyLength = useStudioStore((s) => s.history.length);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  // Keyboard shortcuts (Ctrl+Z / Cmd+Z, Ctrl+Shift+Z / Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const handleCompareMouseDown = useCallback(() => {
    setIsComparing(true);
  }, [setIsComparing]);

  const handleCompareMouseUp = useCallback(() => {
    setIsComparing(false);
  }, [setIsComparing]);

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-green-500/20 bg-black/90 px-3 backdrop-blur-md select-none md:px-5">
      {/* Left: Back to Cam & Logo */}
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-950/20 px-2.5 py-1.5 text-xs font-semibold text-green-400 transition-colors hover:border-green-400 hover:bg-green-900/40 focus-visible:ring-2 focus-visible:ring-green-400/70 focus-visible:outline-none"
          title="Return to Camera"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Camera</span>
        </Link>

        <div className="mx-1 hidden h-4 w-px bg-green-500/30 sm:block" />

        <div className="flex items-center gap-2">
          <img
            src="/assets/logo.png"
            alt="Phosphor"
            className="size-6 object-contain"
          />
          <span className="text-xs font-bold tracking-wider text-green-400 sm:text-sm">
            PHOSPHOR <span className="text-white/80">STUDIO</span>
          </span>
        </div>
      </div>

      {/* Center: Image info or Open Image */}
      <div className="hidden items-center gap-2 md:flex">
        {image ? (
          <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-zinc-950/80 px-3 py-1 font-mono text-[11px] text-zinc-300">
            <ImageIcon size={13} className="text-green-400" />
            <span
              className="max-w-[140px] truncate text-white"
              title={image.name}
            >
              {image.name}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400 tabular-nums">
              {image.width}×{image.height}
            </span>
            <button
              type="button"
              onClick={onOpenFilePicker}
              className="ml-1 cursor-pointer text-green-400 hover:text-green-300 hover:underline"
              title="Replace image"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenFilePicker}
            className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-950/30 px-3 py-1 text-xs font-medium text-green-400 hover:bg-green-900/40"
          >
            <UploadCloud size={14} />
            <span>Open Photo</span>
          </button>
        )}
      </div>

      {/* Right: History, Compare, Reset, Export */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {image && (
          <>
            {/* Undo */}
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:ring-2 focus-visible:ring-green-400/70 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <Undo2 size={16} />
            </button>

            {/* Redo */}
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:ring-2 focus-visible:ring-green-400/70 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30"
              title="Redo (Ctrl+Shift+Z)"
              aria-label="Redo"
            >
              <Redo2 size={16} />
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={resetSettings}
              className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400 focus-visible:ring-2 focus-visible:ring-green-400/70 focus-visible:outline-none"
              title="Reset all adjustments"
              aria-label="Reset adjustments"
            >
              <RotateCcw size={16} />
            </button>

            {/* Compare (Hold to view original) */}
            <button
              type="button"
              onMouseDown={handleCompareMouseDown}
              onMouseUp={handleCompareMouseUp}
              onTouchStart={handleCompareMouseDown}
              onTouchEnd={handleCompareMouseUp}
              className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors select-none focus-visible:ring-2 focus-visible:ring-green-400/70 focus-visible:outline-none ${
                isComparing
                  ? "border-green-400 bg-green-500/20 text-green-300"
                  : "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:text-white"
              }`}
              title="Hold to compare with original"
            >
              <Eye size={15} />
              <span className="hidden sm:inline">Compare</span>
            </button>

            {/* Export */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-green-500 bg-green-600 px-3 py-1.5 text-xs font-bold text-black shadow-md shadow-green-950/50 transition-all hover:bg-green-500 focus-visible:ring-2 focus-visible:ring-green-400/70 focus-visible:outline-none active:scale-95"
            >
              <Download size={15} strokeWidth={2.5} />
              <span>Export</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default memo(StudioHeader);
