import { memo, useCallback } from "react";

import type { Codecs } from "@/shared/types";
import { GroupLabel, Segmented } from "@/shared/ui/controls";

import {
  useSettingsActions,
  useSettingsSelector,
} from "../common/useSettingsControls";

const CODECS: Codecs[] = ["png", "jpeg", "webp"];

const OPTIONS = CODECS.map((codec) => ({
  key: codec,
  label: codec.toUpperCase(),
}));

const CodecSelector = () => {
  const codec = useSettingsSelector((settings) => settings.captureCodec);
  const { updateSettings } = useSettingsActions();

  const handleChange = useCallback(
    (nextCodec: Codecs) => {
      updateSettings({ captureCodec: nextCodec });
    },
    [updateSettings]
  );

  return (
    <section className="space-y-2">
      <GroupLabel>Codec</GroupLabel>
      <Segmented
        label="Codec"
        options={OPTIONS}
        value={codec}
        onChange={handleChange}
      />
    </section>
  );
};
export default memo(CodecSelector);
