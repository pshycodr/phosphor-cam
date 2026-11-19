import { useEffect, useRef } from "react";

import { useBackHandler } from "@/shared/hooks/useBackHandler";
import { usePresence } from "@/shared/hooks/usePresence";
import { Button } from "@/shared/ui/buttons";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

interface DiscardDialogProps {
  open: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

/** Confirms leaving a dirty edit session before the image is cleared. */
function DiscardDialog({ open, onKeepEditing, onDiscard }: DiscardDialogProps) {
  const mounted = usePresence(open, 180);
  const panelRef = useRef<HTMLDivElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);

  useBackHandler(open, onKeepEditing);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() =>
      keepRef.current?.focus({ preventScroll: true })
    );

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onKeepEditing();
        return;
      }

      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const nodes = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((node) => node.offsetParent !== null);

      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (!panel.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus({ preventScroll: true });
    };
  }, [open, onKeepEditing]);

  if (!mounted) return null;

  return (
    <div
      data-state={open ? "open" : "closed"}
      aria-hidden={!open}
      className={`modal-shell fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm ${
        open ? "" : "pointer-events-none"
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && open) onKeepEditing();
      }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="discard-title"
        aria-describedby="discard-desc"
        className="modal-panel w-full max-w-[360px] overflow-hidden rounded-2xl border border-line bg-ink-2 shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
      >
        <div className="px-5 py-5">
          <h2 id="discard-title" className="text-[13px] font-medium text-paper">
            Discard changes?
          </h2>
          <p
            id="discard-desc"
            className="mt-1.5 text-[11px] leading-relaxed text-muted"
          >
            Your edits to this image will be lost.
          </p>
        </div>

        <div className="flex gap-2 border-t border-line/80 px-5 py-4">
          <Button
            ref={keepRef}
            variant="primary"
            className="flex-1"
            onClick={onKeepEditing}
          >
            Keep editing
          </Button>
          <Button
            variant="outline"
            className="flex-1 hover:border-alert/50 hover:text-alert"
            onClick={onDiscard}
          >
            Discard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DiscardDialog;
