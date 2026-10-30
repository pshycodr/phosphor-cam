import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { LuSettings2 } from "react-icons/lu";

import type { SettingsControlsValue } from "@/shared/components/settings/SettingsControls";
import { SettingsControlsProvider } from "@/shared/components/settings/SettingsControlsProvider";
import SettingsSections from "@/shared/components/settings/SettingsSections";
import { useSheetDrag } from "@/shared/hooks/useSheetDrag";

import { VERSION } from "../constants/version";
import { useSettingsStore } from "../store/settingsStore";

function Settings() {
  const [isOpen, setIsOpen] = useState(false);

  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const updateEffect = useSettingsStore((s) => s.updateEffect);

  const controls = useMemo<SettingsControlsValue>(
    () => ({
      settings,
      updateSettings: (patch) => updateSettings(patch),
      updateEffect: (key, patch) => updateEffect(key, patch),
    }),
    [settings, updateSettings, updateEffect]
  );

  const fabRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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
        } inset-x-0 bottom-0 max-h-[75dvh] rounded-t-2xl border-t pb-[env(safe-area-inset-bottom)] sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-96 sm:rounded-none sm:border-t-0 sm:border-l sm:pr-[env(safe-area-inset-right)] sm:pb-0 ${
          isOpen
            ? "translate-y-0 sm:translate-x-0"
            : "invisible translate-y-full sm:translate-x-full sm:translate-y-0"
        }`}
      >
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

        <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto overscroll-contain px-5 pb-6 text-sm text-gray-200">
          <SettingsSections />

          <footer className="mt-6 border-t border-green-500/20 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/logo.png"
                  alt="Phosphor Cam"
                  className="size-8 rounded-lg object-contain"
                />

                <div className="leading-tight">
                  <p className="text-sm font-medium text-green-400">
                    Phosphor Cam
                  </p>

                  <p className="text-[10px] text-green-500/50">{VERSION}</p>
                </div>
              </div>

              <a
                href="https://github.com/pshycodr/phosphor-cam"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Phosphor Cam on GitHub"
                className="rounded-lg p-2 text-green-400/70 transition-colors hover:bg-green-500/10 hover:text-green-400 focus-visible:ring-2 focus-visible:ring-green-400/60 focus-visible:outline-none"
              >
                <FaGithub size={20} />
              </a>
            </div>
          </footer>
        </div>
      </aside>
    </SettingsControlsProvider>
  );
}

export default memo(Settings);
