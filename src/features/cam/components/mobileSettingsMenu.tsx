import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { SlidersHorizontal, X } from "lucide-react";

import CaptureTool from "@/shared/components/settings/mobile/tools/CaptureTool";
import { Segmented } from "@/shared/ui/controls";

import type { AspectRatio } from "../types";
import { AboutCard } from "./AboutCard";

const ASPECT_OPTIONS: readonly { key: AspectRatio; label: ReactNode }[] = [
  {
    key: "square",
    label: (
      <span className="flex flex-col items-center leading-none">
        <span>1:1</span>
        <span className="mt-1 text-[8px] tracking-[0.14em] uppercase opacity-60">
          Square
        </span>
      </span>
    ),
  },
  {
    key: "portrait",
    label: (
      <span className="flex flex-col items-center leading-none">
        <span>3:4</span>
        <span className="mt-1 text-[8px] tracking-[0.14em] uppercase opacity-60">
          Portrait
        </span>
      </span>
    ),
  },
  {
    key: "full",
    label: (
      <span className="flex flex-col items-center leading-none">
        <span>Full</span>
        <span className="mt-1 text-[8px] tracking-[0.14em] uppercase opacity-60">
          Height
        </span>
      </span>
    ),
  },
];

interface MobileSettingsMenuProps {
  aspect: AspectRatio;
  onAspectChange: (aspect: AspectRatio) => void;
}

export function MobileSettingsMenu({
  aspect,
  onAspectChange,
}: MobileSettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);

    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close(true);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    const timer = setTimeout(
      () => closeRef.current?.focus({ preventScroll: true }),
      40
    );

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(timer);
    };
  }, [open, close]);

  return (
    <div ref={wrapRef} className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Camera settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="press flex h-11 items-center gap-2 rounded-full border border-line/80 bg-ink-2/85 px-3.5 text-[10px] font-medium tracking-[0.14em] text-muted uppercase backdrop-blur-xl hover:border-line-strong hover:bg-ink-3 hover:text-paper"
      >
        <SlidersHorizontal size={14} strokeWidth={1.75} aria-hidden="true" />
        <span className="hidden min-[340px]:inline">Settings</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Camera settings"
          className="notice-enter absolute top-full right-0 z-40 mt-2 w-[min(19rem,calc(100vw-1.5rem))] overflow-hidden rounded-[18px] border border-line-strong bg-ink-2/95 shadow-[0_24px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between border-b border-line/60 py-1.5 pr-2 pl-4">
            <h2 className="text-[10px] font-semibold tracking-[0.2em] text-paper uppercase">
              Settings
            </h2>
            <button
              ref={closeRef}
              type="button"
              onClick={() => close(true)}
              aria-label="Close settings"
              className="press flex size-11 items-center justify-center rounded-full text-faint hover:bg-ink-3 hover:text-paper"
            >
              <X size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          <div className="max-h-[min(62dvh,26rem)] overflow-y-auto overscroll-contain">
            <section className="space-y-2 border-b border-line/60 px-4 py-3.5">
              <p className="text-[9px] font-medium tracking-[0.2em] text-faint uppercase">
                Aspect ratio
              </p>
              <Segmented
                label="Aspect ratio"
                value={aspect}
                options={ASPECT_OPTIONS}
                onChange={onAspectChange}
              />
            </section>

            <section className="space-y-3 border-b border-line/60 px-4 py-3.5">
              <p className="text-[9px] font-medium tracking-[0.2em] text-faint uppercase">
                Capture
              </p>
              <CaptureTool />
            </section>

            <section className="space-y-2.5 px-4 py-3">
              <p className="text-[9px] font-medium tracking-[0.2em] text-faint uppercase">
                About
              </p>
              <AboutCard />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
