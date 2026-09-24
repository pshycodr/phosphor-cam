import { memo, useCallback, useState } from "react";

import { useSettingsStore } from "@/store/settingsStore";
import type { Codecs } from "@/types";

const CodecSelector = () => {
  const [codec, setCodec] = useState<Codecs>("png");

  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const CODECS: Codecs[] = ["png", "jpeg", "webp"];

  const handleChange = useCallback(
    (nextCodec: Codecs) => {
      setCodec(nextCodec);
      updateSettings({ captureCodec: nextCodec });
    },
    [updateSettings]
  );

  return (
    <section className="pb-4">
      <h3 className="mb-2 text-xs font-semibold text-green-400">Codec</h3>

      <div
        role="group"
        aria-label="Codec"
        className="flex flex-wrap gap-1 rounded-xl border border-green-500/30 bg-black/30 p-1"
      >
        {CODECS.map((item) => {
          const active = codec === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => handleChange(item)}
              aria-pressed={active}
              className={`min-h-8 grow basis-16 rounded-full px-2.5 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-400/70 ${
                active
                  ? "bg-green-600 text-black"
                  : "text-green-400 hover:bg-green-900/30"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </section>
  );
};
export default memo(CodecSelector);
