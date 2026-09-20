import { memo } from "react";

import { CHAR_SETS, CHARACTER_SETS } from "@/constants/characterSets";
import { useSettingsStore } from "@/store/settingsStore";
import type { AsciiSettings } from "@/types";

const CharacterSet = () => {
  const characterSet = useSettingsStore((s) => s.settings.characterSet);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CHARACTER_SETS.map((set) => {
          const active = characterSet === set;
          return (
            <button
              key={set}
              type="button"
              aria-pressed={active}
              onClick={() =>
                updateSettings({ characterSet: set } as Partial<AsciiSettings>)
              }
              className={`min-w-0 rounded-lg border px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-400/70 ${
                active
                  ? "border-green-400 bg-green-600 text-black"
                  : "border-green-500/40 text-green-400 hover:bg-green-900/20"
              }`}
            >
              <div className="mb-1 truncate text-[11px] font-semibold uppercase">
                {set}
              </div>
              <div className="truncate font-mono text-[11px] leading-tight opacity-80">
                {CHAR_SETS[set].slice(0, 14)}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-green-500/30 bg-black/30 p-3">
        <div className="mb-1 text-[11px] text-green-500/70">Preview</div>
        <div className="max-h-28 overflow-y-auto font-mono text-xs leading-tight wrap-break-word whitespace-pre-wrap text-green-300">
          {CHAR_SETS[characterSet]}
        </div>
      </div>
    </>
  );
};

export default memo(CharacterSet);
