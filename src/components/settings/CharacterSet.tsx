import { memo, useCallback } from "react";

import { CHAR_SETS, CHARACTER_SETS } from "@/constants/characterSets";
import { useSettingsStore } from "@/store/settingsStore";
import type { AsciiSettings } from "@/types";

const CharacterSet = () => {
  const characterSet = useSettingsStore((s) => s.settings.characterSet);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const handleSelect = useCallback(
    (key: keyof AsciiSettings, value: number | string | boolean) =>
      updateSettings({ [key]: value } as Partial<AsciiSettings>),

    [updateSettings]
  );

  return (
    <>
      <div className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
        {CHARACTER_SETS.map((set) => (
          <button
            key={set}
            onClick={() => handleSelect("characterSet", set)}
            className={`min-w-27.5 shrink-0 snap-start rounded-lg border px-3 py-3 text-left ${
              characterSet === set
                ? "border-green-400 bg-green-600 text-black"
                : "border-green-500/50 text-green-400 hover:bg-green-900/20"
            }`}
          >
            <div className="mb-1 text-[11px] font-semibold uppercase">
              {set}
            </div>
            <div className="truncate font-mono text-[11px] leading-tight opacity-80">
              {CHAR_SETS[set].slice(0, 14)}
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-md border border-green-500/40 bg-black/30 p-3">
        <div className="mb-1 text-[10px] text-green-500/70">Preview</div>
        <div className="font-mono text-xs leading-tight wrap-break-word whitespace-pre-wrap text-green-300">
          {CHAR_SETS[characterSet]}
        </div>
      </div>
    </>
  );
};

export default memo(CharacterSet);
