import { memo, type ReactNode, useEffect } from "react";
import { Link } from "react-router";

import {
  ChevronLeft,
  Download,
  Eye,
  Redo2,
  RotateCcw,
  Undo2,
} from "lucide-react";

import { useStudioStore } from "../store/studioStore";

interface StudioHeaderProps {
  onOpenFilePicker: () => void;
}

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-green-400/70 focus-visible:outline-none";

interface IconButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-30 ${
        danger ? "hover:text-red-400" : "hover:text-white"
      } ${focusRing}`}
    >
      {children}
    </button>
  );
}

function StudioHeader({ onOpenFilePicker }: StudioHeaderProps) {
  const image = useStudioStore((s) => s.image);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const resetSettings = useStudioStore((s) => s.resetSettings);
  const isComparing = useStudioStore((s) => s.isComparing);
  const setIsComparing = useStudioStore((s) => s.setIsComparing);
  const setIsExportModalOpen = useStudioStore((s) => s.setIsExportModalOpen);
  const canUndo = useStudioStore((s) => s.historyIndex > 0);
  const canRedo = useStudioStore((s) => s.historyIndex < s.history.length - 1);

  // Undo / redo shortcuts: Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  return (
    <header className="relative top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] z-30 flex h-14 shrink-0 items-center justify-between border-b border-green-500/20 bg-black/90 px-3 backdrop-blur-md select-none md:px-5">
      {/* Left: back + brand */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          title="Return to Camera"
          className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-green-400 transition-colors hover:bg-green-900/40 ${focusRing}`}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Camera</span>
        </Link>

        <div className="flex items-center gap-2">
          <img
            src="/assets/logo.png"
            alt="Phosphor"
            className="size-6 object-contain"
          />
          <span className="text-sm font-medium text-white/80">STUDIO</span>
        </div>
      </div>

      {/* Center: current image */}
      {image && (
        <div className="hidden items-center gap-2 font-mono text-[11px] text-zinc-400 md:flex">
          <span
            className="max-w-[160px] truncate text-white"
            title={image.name}
          >
            {image.name}
          </span>
          <span className="tabular-nums">
            {image.width}×{image.height}
          </span>
          <button
            type="button"
            onClick={onOpenFilePicker}
            className={`text-green-400 hover:underline ${focusRing}`}
          >
            Change
          </button>
        </div>
      )}

      {/* Right: actions */}
      {image && (
        <div className="flex items-center gap-1.5">
          <IconButton label="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo}>
            <Undo2 size={16} />
          </IconButton>
          <IconButton
            label="Redo (Ctrl+Shift+Z)"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo2 size={16} />
          </IconButton>
          <IconButton
            label="Reset all adjustments"
            onClick={resetSettings}
            danger
          >
            <RotateCcw size={16} />
          </IconButton>

          <button
            type="button"
            title="Hold to compare with original"
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onMouseLeave={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              isComparing
                ? "bg-green-500/20 text-green-300"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
            } ${focusRing}`}
          >
            <Eye size={15} />
            <span className="hidden sm:inline">Compare</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className={`flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-green-500 ${focusRing}`}
          >
            <Download size={15} strokeWidth={2.5} />
            Export
          </button>
        </div>
      )}
    </header>
  );
}

export default memo(StudioHeader);
