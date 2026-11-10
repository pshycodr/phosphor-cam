import { memo } from "react";

import { CHAR_SETS, CHARACTER_SETS } from "@/shared/constants/characterSets";
import type { AsciiSettings } from "@/shared/types";

import {
  useSettingsActions,
  useSettingsSelector,
} from "../../common/useSettingsControls";
import { ScrollRow } from "../primitives";

const CharsTool = () => {
  const characterSet = useSettingsSelector((s) => s.characterSet);
  const { updateSettings } = useSettingsActions();

  return (
    <div className="space-y-3">
      <ScrollRow>
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
              className={`w-28 shrink-0 snap-start rounded-xl border px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-400/70 ${
                active
                  ? "border-green-400 bg-green-500 text-black"
                  : "border-green-500/30 bg-black/40 text-green-400 active:bg-green-900/40"
              }`}
            >
              <span className="mb-1 block truncate text-[11px] font-bold uppercase">
                {set}
              </span>
              <span className="block truncate font-mono text-sm leading-tight opacity-80">
                {CHAR_SETS[set].slice(0, 10)}
              </span>
            </button>
          );
        })}
      </ScrollRow>

      <div className="rounded-xl border border-green-500/20 bg-black/30 px-3 py-2">
        <p className="mb-0.5 text-[10px] font-semibold tracking-wide text-green-500/60 uppercase">
          Characters
        </p>
        <p className="line-clamp-2 font-mono text-xs leading-snug break-all text-green-300">
          {CHAR_SETS[characterSet]}
        </p>
      </div>
    </div>
  );
};

export default memo(CharsTool);
