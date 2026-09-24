import {
  memo,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { IoClose } from "react-icons/io5";
import {
  LuCamera,
  LuPalette,
  LuSettings2,
  LuSlidersHorizontal,
  LuSparkles,
  LuType,
} from "react-icons/lu";

import { type SectionId } from "@/constants/settings";
import { useSettingsStore } from "@/store/settingsStore";

import Accordion from "./Accordion";
import AppearanceBadge from "./AppearanceBadge";
import AppearanceMode from "./AppearanceMode";
import CaptureScale from "./CaptureScale";
import CharacterSet from "./CharacterSet";
import Codec from "./Codec";
import EffectsPanel from "./EffectsPanel";
import LinesDirectionPicker from "./LinesDirectionPicker";
import RenderMode from "./RenderMode";
import AdjustmentsContent from "./SliderRow";
import ToggleRow from "./ToggleRow";

// Character set badge
const CharacterSetBadge = memo(() => {
  const characterSet = useSettingsStore((s) => s.settings.characterSet);
  return <span className="capitalize">{characterSet}</span>;
});

const CaptureBadge = memo(() => {
  const codec = useSettingsStore((s) => s.settings.captureCodec);
  const scale = useSettingsStore((s) => s.settings.captureScale);

  return (
    <span>
      {scale}X, {codec}
    </span>
  );
});

// Adjustments badge
const AdjustmentsBadge = memo(() => {
  const fontSize = useSettingsStore((s) => s.settings.fontSize);
  return <>{fontSize}px</>;
});

// Effects badge
const EffectsBadge = memo(() => {
  const effects = useSettingsStore((s) => s.settings.effects);

  const activeCount = Object.values(effects).filter(
    (effect) => effect.enabled
  ).length;

  const totalCount = Object.keys(effects).length;

  return <>{activeCount > 0 ? `${activeCount}/${totalCount} active` : "Off"}</>;
});

const CLOSE_DRAG_PX = 80;

/** Drag handle behaviour for the mobile bottom sheet. */
function useSheetDrag(onClose: () => void) {
  const startY = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (startY.current === null) return;
    setOffset(Math.max(0, e.clientY - startY.current));
  }, []);

  const end = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (startY.current === null) return;
      const dragged = e.clientY - startY.current;
      startY.current = null;
      setOffset(0);
      if (dragged > CLOSE_DRAG_PX) onClose();
    },
    [onClose]
  );

  return {
    offset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    },
  };
}

function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<SectionId | null>(
    "adjustments"
  );

  const renderMode = useSettingsStore((s) => s.settings.renderMode);
  const voxel3D = useSettingsStore((s) => s.settings.voxel3d);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const fabRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const toggleVoxel3DMode = useCallback(
    () =>
      updateSettings({
        voxel3d: !useSettingsStore.getState().settings.voxel3d,
      }),
    [updateSettings]
  );

  const open = useCallback(() => {
    setIsOpen(true);
    requestAnimationFrame(() =>
      closeRef.current?.focus({ preventScroll: true })
    );
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => fabRef.current?.focus({ preventScroll: true }));
  }, []);

  const toggleSection = useCallback(
    (id: SectionId) =>
      setOpenSection((current) => (current === id ? null : id)),
    []
  );

  const { offset, handlers } = useSheetDrag(close);

  // Escape key => close pannel
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <>
      {!isOpen && (
        <button
          ref={fabRef}
          type="button"
          aria-label="Open settings"
          className="fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-50 rounded-lg border border-green-500/30 bg-black/40 p-3 text-green-400 shadow-lg backdrop-blur-sm transition-colors outline-none hover:border-green-400 hover:bg-green-900/30 focus-visible:ring-2 focus-visible:ring-green-400/70"
          onClick={open}
        >
          <LuSettings2 size={24} />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-30 sm:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Settings"
        style={offset ? { transform: `translateY(${offset}px)` } : undefined}
        className={`fixed z-40 flex w-full flex-col border-green-500/30 bg-black/90 shadow-2xl backdrop-blur-xl motion-reduce:transition-none ${
          offset
            ? "transition-none"
            : "transition-[transform,translate,visibility] duration-300 ease-out"
        } inset-x-0 bottom-0 max-h-[62dvh] rounded-t-2xl border-t pb-[env(safe-area-inset-bottom)] sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-96 sm:rounded-none sm:border-t-0 sm:border-l sm:pr-[env(safe-area-inset-right)] sm:pb-0 ${
          isOpen
            ? "translate-y-0 sm:translate-x-0"
            : "invisible translate-y-full sm:translate-x-full sm:translate-y-0"
        }`}
      >
        {/* Drag handle - phones only, swipe down to dismiss */}
        <div
          {...handlers}
          className="flex shrink-0 cursor-grab touch-none justify-center pt-3 pb-2 sm:hidden"
          aria-hidden="true"
        >
          <div className="h-1 w-10 rounded-full bg-green-500/40" />
        </div>

        <header className="flex shrink-0 items-center justify-between border-b border-green-500/30 px-5 py-2 sm:py-4">
          <h2 className="text-lg font-bold tracking-wide text-green-400">
            Settings
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close settings"
            className="-mr-2 flex size-10 items-center justify-center rounded-lg text-green-400 transition-colors outline-none hover:bg-green-900/30 focus-visible:ring-2 focus-visible:ring-green-400/70"
            onClick={close}
          >
            <IoClose size={24} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 text-sm text-gray-200">
          <RenderMode />

          <Accordion
            id="capture"
            icon={<LuCamera size={16} />}
            title="Capture"
            badge={<CaptureBadge />}
            isOpen={openSection === "capture"}
            onToggle={toggleSection}
          >
            <Codec />
            <CaptureScale />
          </Accordion>

          <Accordion
            id="adjustments"
            icon={<LuSlidersHorizontal size={16} />}
            title="Adjustments"
            badge={<AdjustmentsBadge />}
            isOpen={openSection === "adjustments"}
            onToggle={toggleSection}
          >
            {renderMode === "voxel" && (
              <ToggleRow
                label="Voxel 3D Mode"
                description=""
                checked={voxel3D}
                onChange={toggleVoxel3DMode}
              />
            )}

            {renderMode === "lines" && <LinesDirectionPicker />}

            <AdjustmentsContent />
          </Accordion>

          <Accordion
            id="effects"
            icon={<LuSparkles size={16} />}
            title="Effects"
            badge={<EffectsBadge />}
            isOpen={openSection === "effects"}
            onToggle={toggleSection}
          >
            <EffectsPanel />
          </Accordion>

          {renderMode === "ascii" && (
            <Accordion
              id="characterSet"
              icon={<LuType size={16} />}
              title="Character set"
              badge={<CharacterSetBadge />}
              isOpen={openSection === "characterSet"}
              onToggle={toggleSection}
            >
              <CharacterSet />
            </Accordion>
          )}

          <Accordion
            id="appearance"
            icon={<LuPalette size={16} />}
            title="Appearance"
            badge={<AppearanceBadge />}
            isOpen={openSection === "appearance"}
            onToggle={toggleSection}
          >
            <AppearanceMode />
          </Accordion>
        </div>
      </aside>
    </>
  );
}

export default memo(Settings);
