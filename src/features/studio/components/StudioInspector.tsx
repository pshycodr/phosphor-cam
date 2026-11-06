import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SlidersHorizontal, Sparkles, X } from "lucide-react";

import type { SettingsControlsValue } from "@/shared/components/settings/SettingsControls";
import { SettingsControlsProvider } from "@/shared/components/settings/SettingsControlsProvider";
import SettingsSections, {
  type ExtraSettingsSection,
} from "@/shared/components/settings/SettingsSections";
import { useSheetDrag } from "@/shared/hooks/useSheetDrag";

import { STUDIO_PRESETS } from "../constants/presets";
import { useStudioStore } from "../store/studioStore";

import PresetsPanel from "./controls/PresetsPanel";

const PRESETS_SECTION: ExtraSettingsSection = {
  id: "presets",
  icon: <Sparkles size={16} />,
  title: "Presets",
  badge: <>{STUDIO_PRESETS.length} looks</>,
  content: <PresetsPanel />,
};

const LEADING_SECTIONS = [PRESETS_SECTION];

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-green-400/70 focus-visible:outline-none";

function StudioInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const updateSettings = useStudioStore((s) => s.updateSettings);
  const updateEffect = useStudioStore((s) => s.updateEffect);

  const controls = useMemo<SettingsControlsValue>(
    () => ({
      getSettings: () => useStudioStore.getState().settings,
      subscribe: (listener) => useStudioStore.subscribe(listener),
      updateSettings: (patch, options) =>
        updateSettings(patch, options?.history ?? true),
      updateEffect: (key, patch, options) =>
        updateEffect(key, patch, options?.history ?? true),
    }),
    [updateSettings, updateEffect]
  );

  const open = () => {
    setIsOpen(true);
    requestAnimationFrame(() =>
      closeRef.current?.focus({ preventScroll: true })
    );
  };

  const close = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => fabRef.current?.focus({ preventScroll: true }));
  }, []);

  const { offset, handlers } = useSheetDrag(close);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <SettingsControlsProvider value={controls}>
      {/* Desktop sidebar */}
      <aside
        aria-label="Editing controls"
        className="hidden h-full w-84 shrink-0 flex-col border-l border-zinc-800 bg-zinc-950 select-none lg:flex"
      >
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-800 px-4 text-sm font-semibold text-green-400">
          <SlidersHorizontal size={16} />
          Inspector
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          <SettingsSections
            idPrefix="studio-desktop"
            leadingSections={LEADING_SECTIONS}
          />
        </div>
      </aside>

      {/* Mobile: button + bottom sheet */}
      {!isOpen && (
        <button
          ref={fabRef}
          type="button"
          onClick={open}
          aria-label="Open editing controls"
          className={`fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex min-h-12 items-center gap-2 rounded-full bg-green-500 px-4 text-sm font-semibold text-black lg:hidden ${focusRing}`}
        >
          <SlidersHorizontal size={18} />
          Adjust
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-label="Editing controls"
        style={offset ? { transform: `translateY(${offset}px)` } : undefined}
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[86dvh] flex-col rounded-t-2xl border-t border-zinc-800 bg-zinc-950 pb-[env(safe-area-inset-bottom)] motion-reduce:transition-none lg:hidden ${
          offset
            ? "transition-none"
            : "transition-[transform,translate,visibility] duration-300 ease-out"
        } ${isOpen ? "visible translate-y-0" : "invisible translate-y-full"}`}
      >
        <div
          {...handlers}
          className="flex shrink-0 cursor-grab touch-none justify-center pt-3 pb-2"
          aria-hidden="true"
        >
          <div className="h-1 w-10 rounded-full bg-zinc-700" />
        </div>

        <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-5 py-2">
          <h2 className="text-sm font-semibold text-green-400">
            Editing controls
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close editing controls"
            className={`-mr-2 flex size-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:text-white ${focusRing}`}
          >
            <X size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-8 text-sm text-gray-200">
          <SettingsSections
            idPrefix="studio-mobile"
            leadingSections={LEADING_SECTIONS}
          />
        </div>
      </aside>
    </SettingsControlsProvider>
  );
}

export default memo(StudioInspector);
