import { memo } from "react";

import { CHAR_SETS, CHARACTER_SETS } from "@/shared/constants/characterSets";
import type { AsciiSettings } from "@/shared/types";

import {
  useSettingsActions,
  useSettingsSelector,
} from "../common/useSettingsControls";

const CharacterSet = () => {
  const characterSet = useSettingsSelector((settings) => settings.characterSet);
  const { updateSettings } = useSettingsActions();

  return (
    <>
      <div className="grid grid-cols-2 gap-1.5">
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
              className={`press min-w-0 rounded-lg border px-3 py-2 text-left ${
                active
                  ? "border-signal/60 bg-signal/10 text-signal"
                  : "border-line/80 bg-ink-3/40 text-muted hover:border-line-strong hover:text-paper"
              }`}
            >
              <div className="mb-0.5 truncate text-[10px] font-medium tracking-[0.12em] uppercase">
                {set}
              </div>
              <div className="truncate font-mono text-[10px] leading-tight opacity-70">
                {CHAR_SETS[set].slice(0, 14)}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-line/80 bg-ink-3/40 px-3 py-2">
        <div className="mb-1 font-mono text-[9px] tracking-[0.16em] text-faint uppercase">
          Preview
        </div>
        <div className="max-h-24 overflow-y-auto font-mono text-[11px] leading-tight break-all whitespace-pre-wrap text-muted">
          {CHAR_SETS[characterSet]}
        </div>
      </div>
    </>
  );
};

export default memo(CharacterSet);
