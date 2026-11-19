import { memo, type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";

import {
  ChevronLeft,
  Download,
  Eye,
  Redo2,
  RotateCcw,
  Undo2,
} from "lucide-react";

import { IconButton } from "@/shared/ui/buttons";

import { useStudioStore } from "../store/studioStore";

interface StudioHeaderProps {
  onOpenFilePicker: () => void;
}

interface ActionProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}

function Action({ label, onClick, disabled, danger, children }: ActionProps) {
  return (
    <IconButton
      label={label}
      size="md"
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      className={danger ? "hover:text-alert" : undefined}
    >
      {children}
    </IconButton>
  );
}

function StudioHeader({ onOpenFilePicker }: StudioHeaderProps) {
  const navigate = useNavigate();
  const image = useStudioStore((s) => s.image);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const resetSettings = useStudioStore((s) => s.resetSettings);
  const isComparing = useStudioStore((s) => s.isComparing);
  const setIsComparing = useStudioStore((s) => s.setIsComparing);
  const setIsExportModalOpen = useStudioStore((s) => s.setIsExportModalOpen);
  const canUndo = useStudioStore((s) => s.historyIndex > 0);
  const canRedo = useStudioStore((s) => s.historyIndex < s.history.length - 1);

  useEffect(() => {
    const isTextEntry = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.isContentEditable) return true;
      if (target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return true;
      }
      if (target.tagName === "INPUT") {
        const type = (target as HTMLInputElement).type;
        return !["range", "checkbox", "radio", "button", "submit"].includes(
          type
        );
      }
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      if (isTextEntry(e.target)) return;

      const key = e.key.toLowerCase();
      if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  const stopCompare = () => setIsComparing(false);

  const goToCamera = () => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <header className="relative z-30 flex shrink-0 flex-col border-b border-line/80 bg-ink/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl select-none">
      <div className="relative flex h-14 items-center justify-between gap-2 pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.75rem,env(safe-area-inset-left))] md:pr-[max(1.25rem,env(safe-area-inset-right))] md:pl-[max(1.25rem,env(safe-area-inset-left))]">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={goToCamera}
            title="Return to camera"
            className="press flex h-11 min-w-11 items-center justify-center gap-1 rounded-full pr-2 pl-1.5 text-[10px] font-medium tracking-[0.12em] text-muted uppercase hover:bg-ink-3 hover:text-paper"
          >
            <ChevronLeft size={15} aria-hidden="true" />
            <span className={image ? "hidden sm:inline" : ""}>Camera</span>
          </button>

          <span aria-hidden="true" className="h-4 w-px bg-line" />

          <img
            src="/assets/logo.png"
            alt=""
            className="size-5 object-contain"
          />
          <span
            className={`${
              image ? "hidden min-[430px]:inline" : ""
            } text-[11px] font-semibold tracking-[0.18em] text-paper uppercase`}
          >
            Studio
          </span>
        </div>

        {image && (
          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 font-mono text-[10px] text-faint tabular-nums lg:flex">
            <span
              className="max-w-[180px] truncate text-muted"
              title={image.name}
            >
              {image.name}
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-line" />
            <span>
              {image.width}×{image.height}
            </span>
            <button
              type="button"
              onClick={onOpenFilePicker}
              className="pointer-events-auto text-paper underline decoration-line-strong underline-offset-4 hover:decoration-signal"
            >
              Change
            </button>
          </div>
        )}

        {image && (
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Action label="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo}>
              <Undo2 size={15} aria-hidden="true" />
            </Action>
            <Action
              label="Redo (Ctrl+Shift+Z / Ctrl+Y)"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo2 size={15} aria-hidden="true" />
            </Action>
            <Action
              label="Reset all adjustments"
              onClick={resetSettings}
              danger
            >
              <RotateCcw size={15} aria-hidden="true" />
            </Action>

            <span aria-hidden="true" className="mx-1 h-4 w-px bg-line" />

            <button
              type="button"
              title="Hold to compare with the original"
              aria-pressed={isComparing}
              onMouseDown={() => setIsComparing(true)}
              onMouseUp={stopCompare}
              onMouseLeave={stopCompare}
              onTouchStart={() => setIsComparing(true)}
              onTouchEnd={stopCompare}
              onTouchCancel={stopCompare}
              className={`press flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border px-3 text-[10px] font-medium tracking-[0.12em] uppercase ${
                isComparing
                  ? "border-signal/50 bg-signal/10 text-signal"
                  : "border-transparent text-muted hover:bg-ink-3 hover:text-paper"
              }`}
            >
              <Eye size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Compare</span>
            </button>

            <button
              type="button"
              aria-label="Export"
              onClick={() => setIsExportModalOpen(true)}
              className="press ml-0.5 flex h-11 items-center gap-2 rounded-full bg-paper px-3.5 text-[10px] font-semibold tracking-[0.12em] text-ink uppercase hover:bg-white"
            >
              <Download size={14} strokeWidth={2} aria-hidden="true" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default memo(StudioHeader);
