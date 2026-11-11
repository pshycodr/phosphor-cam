import { memo, type RefObject, useEffect, useMemo, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { LuInfo, LuSettings2 } from "react-icons/lu";

import type { SettingsControlsValue } from "@/shared/components/settings/common/SettingsControls";
import { SettingsControlsProvider } from "@/shared/components/settings/common/SettingsControlsProvider";
import { useMediaQuery } from "@/shared/components/settings/common/useMediaQuery";
import SettingsSections from "@/shared/components/settings/desktop/SettingsSections";
import MobileEditor from "@/shared/components/settings/mobile/MobileEditor";
import type { EditorTool } from "@/shared/components/settings/mobile/types";

import { useSettingsStore } from "../store/settingsStore";
import { AboutCard } from "./AboutCard";

// Module-level so the dock's tool list stays referentially stable.
const TRAILING_TOOLS: EditorTool[] = [
  {
    id: "about",
    label: "About",
    icon: <LuInfo size={22} />,
    content: <AboutCard />,
  },
];

interface SettingsProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** The mobile trigger in the controls row, so focus can return to it. */
  triggerRef?: RefObject<HTMLButtonElement | null>;
}

function Settings({ open, onOpen, onClose, triggerRef }: SettingsProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const updateEffect = useSettingsStore((s) => s.updateEffect);

  const controls = useMemo<SettingsControlsValue>(
    () => ({
      getSettings: () => useSettingsStore.getState().settings,
      subscribe: (listener) => useSettingsStore.subscribe(listener),
      updateSettings: (patch) => updateSettings(patch),
      updateEffect: (key, patch) => updateEffect(key, patch),
    }),
    [updateSettings, updateEffect]
  );

  const fabRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(open);

  useEffect(() => {
    if (!open || !isDesktop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isDesktop, onClose]);

  // Move focus into the panel on open and back to its trigger on close.
  useEffect(() => {
    if (wasOpen.current === open) return;
    wasOpen.current = open;

    const target = open
      ? isDesktop
        ? closeRef.current
        : null
      : isDesktop
        ? fabRef.current
        : (triggerRef?.current ?? null);

    if (target) {
      requestAnimationFrame(() => target.focus({ preventScroll: true }));
    }
  }, [open, isDesktop, triggerRef]);

  return (
    <SettingsControlsProvider value={controls}>
      {/* Desktop trigger; on mobile the controls row owns the settings button. */}
      {isDesktop && !open && (
        <button
          ref={fabRef}
          type="button"
          aria-label="Open settings"
          className="fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-50 rounded-lg border border-green-500/30 bg-black/40 p-3 text-green-400 shadow-lg backdrop-blur-sm transition-colors outline-none hover:border-green-400 hover:bg-green-900/30 focus-visible:ring-2 focus-visible:ring-green-400/70"
          onClick={onOpen}
        >
          <LuSettings2 size={24} />
        </button>
      )}

      {isDesktop ? (
        <aside
          aria-label="Settings"
          className={`fixed inset-y-0 right-0 z-40 flex w-96 flex-col border-l border-green-500/30 bg-black/90 pr-[env(safe-area-inset-right)] shadow-2xl backdrop-blur-xl transition-[transform,translate,visibility] duration-300 ease-out motion-reduce:transition-none ${
            open ? "translate-x-0" : "invisible translate-x-full"
          }`}
        >
          <header className="flex shrink-0 items-center justify-between border-b border-green-500/30 px-5 py-4">
            <h2 className="text-lg font-bold tracking-wide text-green-400">
              Settings
            </h2>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close settings"
              className="-mr-2 flex size-10 items-center justify-center rounded-lg text-green-400 transition-colors outline-none hover:bg-green-900/30 focus-visible:ring-2 focus-visible:ring-green-400/70"
              onClick={onClose}
            >
              <IoClose size={24} />
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto overscroll-contain px-5 pb-6 text-sm text-gray-200">
            <SettingsSections />

            <footer className="mt-6 border-t border-green-500/20 pt-4">
              <AboutCard />
            </footer>
          </div>
        </aside>
      ) : (
        <MobileEditor
          open={open}
          onClose={onClose}
          defaultTool="adjust"
          trailingTools={TRAILING_TOOLS}
        />
      )}
    </SettingsControlsProvider>
  );
}

export default memo(Settings);
