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
              className={`w-28 shrink-0 snap-start rounded-xl border px-3 py-2.5 text-left transition-colors ${
                active
                  ? "border-signal/60 bg-signal/10 text-signal"
                  : "border-line/80 bg-ink-3/40 text-muted active:bg-ink-3"
              }`}
            >
              <span className="mb-1 block truncate text-[10px] font-medium tracking-[0.12em] uppercase">
                {set}
              </span>
              <span className="block truncate font-mono text-[11px] leading-tight opacity-70">
                {CHAR_SETS[set].slice(0, 10)}
              </span>
            </button>
          );
        })}
      </ScrollRow>

      <div className="rounded-xl border border-line/80 bg-ink-3/40 px-3 py-2">
        <p className="mb-0.5 font-mono text-[9px] tracking-[0.16em] text-faint uppercase">
          Characters
        </p>
        <p className="line-clamp-2 font-mono text-[11px] leading-snug break-all text-muted">
          {CHAR_SETS[characterSet]}
        </p>
      </div>
    </div>
  );
};

export default memo(CharsTool);
