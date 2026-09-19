import { memo, useCallback, useState } from "react";
import { IoClose } from "react-icons/io5";
import {
  LuPalette,
  LuSettings2,
  LuSlidersHorizontal,
  LuType,
} from "react-icons/lu";

import { useSettingsStore } from "@/store/settingsStore";

import Accordion from "./Accordion";
import AppearanceBadge from "./AppearanceBadge";
import AppearanceMode from "./AppearanceMode";
import CharacterSet from "./CharacterSet";
import { type SectionId } from "./contants";
import RenderMode from "./RenderMode";
import AdjustmentsContent from "./SliderRow";

// Character set badge
const CharacterSetBadge = memo(() => {
  const characterSet = useSettingsStore((s) => s.settings.characterSet);
  return <span className="capitalize">{characterSet}</span>;
});

// Adjustments badge
const AdjustmentsBadge = memo(() => {
  const fontSize = useSettingsStore((s) => s.settings.fontSize);
  return <>{fontSize}px</>;
});

function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<SectionId | null>(
    "adjustments"
  );

  const renderMode = useSettingsStore((s) => s.settings.renderMode);

  const toggleSection = useCallback(
    (id: SectionId) =>
      setOpenSection((current) => (current === id ? null : id)),
    []
  );

  return (
    <>
      {!isOpen && (
        <button
          className="fixed top-4 right-4 z-50 rounded-lg border border-green-500/30 bg-black/40 p-3 text-green-400 shadow-lg backdrop-blur-sm hover:border-green-400 hover:bg-green-900/30"
          onClick={() => setIsOpen(true)}
        >
          <LuSettings2 size={24} />
        </button>
      )}

      {isOpen && (
        <>
          {/* Mobile only */}
          <div
            className="fixed inset-0 z-30 bg-black/50 sm:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <aside className="fixed inset-x-0 bottom-0 z-40 flex max-h-[70vh] w-full flex-col rounded-t-2xl bg-black pb-[env(safe-area-inset-bottom)] shadow-2xl sm:inset-y-0 sm:right-0 sm:bottom-auto sm:left-auto sm:max-h-full sm:w-96 sm:rounded-none sm:pb-0">
            {/* Drag-handle affordance - mobile only, purely visual */}
            <div className="flex justify-center pt-2 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-green-500/30" />
            </div>

            <header className="flex items-center justify-between border-b border-green-600 px-5 py-4 sm:py-6">
              <h2 className="text-xl font-bold tracking-wide text-green-400">
                Settings
              </h2>
              <button
                className="rounded-lg p-2 text-green-400 hover:bg-green-900/30"
                onClick={() => setIsOpen(false)}
              >
                <IoClose size={24} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-8 text-sm text-gray-200 sm:pb-24">
              <RenderMode />

              <Accordion
                id="adjustments"
                icon={<LuSlidersHorizontal size={16} />}
                title="Adjustments"
                badge={<AdjustmentsBadge />}
                isOpen={openSection === "adjustments"}
                onToggle={toggleSection}
              >
                <AdjustmentsContent />
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
      )}
    </>
  );
}

export default memo(Settings);
