import { memo, type RefObject, useEffect, useMemo, useRef } from "react";
import { LuInfo } from "react-icons/lu";

import { SlidersHorizontal, X } from "lucide-react";

import type { SettingsControlsValue } from "@/shared/components/settings/common/SettingsControls";
import { SettingsControlsProvider } from "@/shared/components/settings/common/SettingsControlsProvider";
import { useMediaQuery } from "@/shared/components/settings/common/useMediaQuery";
import SettingsSections from "@/shared/components/settings/desktop/SettingsSections";
import MobileEditor from "@/shared/components/settings/mobile/MobileEditor";
import type { EditorTool } from "@/shared/components/settings/mobile/types";
import { IconButton } from "@/shared/ui/buttons";

import { useSettingsStore } from "../store/settingsStore";
import { AboutCard } from "./AboutCard";

const TRAILING_TOOLS: EditorTool[] = [
  {
    id: "about",
    label: "About",
    icon: <LuInfo size={20} />,
    content: <AboutCard />,
  },
];

interface SettingsProps {
  open: boolean;
  onClose: () => void;
  triggerRef?: RefObject<HTMLButtonElement | null>;
  desktopTriggerRef?: RefObject<HTMLButtonElement | null>;
}

function Settings({
  open,
  onClose,
  triggerRef,
  desktopTriggerRef,
}: SettingsProps) {
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

  useEffect(() => {
    if (wasOpen.current === open) return;
    wasOpen.current = open;

    const target = open
      ? isDesktop
        ? closeRef.current
        : null
      : isDesktop
        ? (desktopTriggerRef?.current ?? null)
        : (triggerRef?.current ?? null);

    if (target) {
      const timer = setTimeout(() => target.focus({ preventScroll: true }), 40);
      return () => clearTimeout(timer);
    }
  }, [open, isDesktop, triggerRef, desktopTriggerRef]);

  return (
    <SettingsControlsProvider value={controls}>
      {isDesktop ? (
        <aside
          aria-label="Settings"
          aria-hidden={!open}
          data-open={open}
          className={`rail-panel translucent fixed inset-y-0 right-0 z-40 flex w-[360px] max-w-[calc(100vw-3rem)] flex-col border-l border-line/80 bg-ink/95 pr-[env(safe-area-inset-right)] shadow-[-24px_0_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl ${
            open ? "visible translate-x-0" : "invisible translate-x-full"
          }`}
        >
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-line/80 pr-3 pl-5">
            <div className="flex items-center gap-2.5 text-paper">
              <SlidersHorizontal
                size={15}
                strokeWidth={1.75}
                aria-hidden="true"
                className="text-signal"
              />
              <h2 className="text-[11px] font-semibold tracking-[0.2em] uppercase">
                Settings
              </h2>
            </div>

            <IconButton
              ref={closeRef}
              label="Close settings"
              size="sm"
              onClick={onClose}
            >
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            </IconButton>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
            <SettingsSections />

            <footer className="mt-6 border-t border-line/80 pt-4">
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
