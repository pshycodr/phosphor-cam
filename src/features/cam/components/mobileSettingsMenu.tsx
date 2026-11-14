import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";

import { X } from "lucide-react";

import CaptureTool from "@/shared/components/settings/mobile/tools/CaptureTool";
import { Segmented } from "@/shared/ui/controls";

import type { AspectRatio } from "../types";
import { AboutCard } from "./AboutCard";

const ASPECT_OPTIONS: readonly { key: AspectRatio; label: ReactNode }[] = [
  {
    key: "1:1",
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
    key: "3:4",
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
          Screen
        </span>
      </span>
    ),
  },
];

interface MobileSettingsMenuProps {
  id: string;
  open: boolean;
  onClose: () => void;
  /** The trigger's parent; presses inside it are not "outside". */
  anchorRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  aspect: AspectRatio;
  onAspectChange: (aspect: AspectRatio) => void;
}

export function MobileSettingsMenu({
  id,
  open,
  onClose,
  anchorRef,
  triggerRef,
  aspect,
  onAspectChange,
}: MobileSettingsMenuProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(
    (restoreFocus = false) => {
      onClose();

      if (restoreFocus) {
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    },
    [onClose, triggerRef]
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) onClose();
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
  }, [open, onClose, close, anchorRef]);

  if (!open) return null;

  const chooseAspect = (next: AspectRatio) => {
    onAspectChange(next);
    close(true);
  };

  return (
    <div
      id={id}
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
            onChange={chooseAspect}
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
  );
}
