import { memo, type ReactNode, useCallback, useState } from "react";
import {
  LuCamera,
  LuPalette,
  LuSlidersHorizontal,
  LuSparkles,
  LuType,
} from "react-icons/lu";

import EffectsPanel from "../common/EffectsPanel";
import ToggleRow from "../common/ToggleRow";
import {
  useSettingsActions,
  useSettingsSelector,
} from "../common/useSettingsControls";
import Accordion from "./Accordion";
import AppearanceBadge from "./AppearanceBadge";
import AppearanceMode from "./AppearanceMode";
import CaptureScale from "./CaptureScale";
import CharacterSet from "./CharacterSet";
import Codec from "./Codec";
import LinesDirectionPicker from "./LinesDirectionPicker";
import RenderMode from "./RenderMode";
import AdjustmentsContent from "./SliderRow";

export interface ExtraSettingsSection {
  id: string;
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
  content: ReactNode;
  visible?: boolean;
}

interface SettingsSectionsProps {
  leadingSections?: ExtraSettingsSection[];
  trailingSections?: ExtraSettingsSection[];
  showCapture?: boolean;
  defaultOpenSection?: string | null;
  className?: string;
  idPrefix?: string;
}

const CharacterSetBadge = memo(() => {
  const characterSet = useSettingsSelector((settings) => settings.characterSet);
  return <span className="capitalize">{characterSet}</span>;
});

const CaptureBadge = memo(() => {
  const captureScale = useSettingsSelector((settings) => settings.captureScale);
  const captureCodec = useSettingsSelector((settings) => settings.captureCodec);

  return (
    <span>
      {captureScale}X, {captureCodec}
    </span>
  );
});

const AdjustmentsBadge = memo(() => {
  const fontSize = useSettingsSelector((settings) => settings.fontSize);
  return <>{fontSize}px</>;
});

const EffectsBadge = memo(() => {
  const activeEffects = useSettingsSelector((settings) => {
    const effects = Object.values(settings.effects);
    const activeCount = effects.filter((effect) => effect.enabled).length;
    return activeCount > 0 ? `${activeCount}/${effects.length} active` : "Off";
  });

  return <>{activeEffects}</>;
});

const Voxel3DToggle = memo(() => {
  const voxel3d = useSettingsSelector((settings) => settings.voxel3d);
  const { updateSettings } = useSettingsActions();

  const toggle = useCallback(
    () => updateSettings({ voxel3d: !voxel3d }),
    [updateSettings, voxel3d]
  );

  return (
    <ToggleRow
      label="Voxel 3D Mode"
      description="Render raised, shaded voxel cubes."
      checked={voxel3d}
      onChange={toggle}
    />
  );
});

function SettingsSections({
  leadingSections = [],
  trailingSections = [],
  showCapture = true,
  defaultOpenSection = "adjustments",
  className = "",
  idPrefix = "settings",
}: SettingsSectionsProps) {
  const renderMode = useSettingsSelector((settings) => settings.renderMode);
  const [openSection, setOpenSection] = useState<string | null>(
    defaultOpenSection
  );

  const toggleSection = useCallback(
    (id: string) => setOpenSection((current) => (current === id ? null : id)),
    []
  );

  const renderExtraSection = (section: ExtraSettingsSection) => {
    if (section.visible === false) return null;

    return (
      <Accordion
        key={section.id}
        id={section.id}
        idPrefix={idPrefix}
        icon={section.icon}
        title={section.title}
        badge={section.badge}
        isOpen={openSection === section.id}
        onToggle={toggleSection}
      >
        {section.content}
      </Accordion>
    );
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {leadingSections.map(renderExtraSection)}

      <RenderMode />

      {showCapture && (
        <Accordion
          id="capture"
          idPrefix={idPrefix}
          icon={<LuCamera size={16} />}
          title="Capture & export"
          badge={<CaptureBadge />}
          isOpen={openSection === "capture"}
          onToggle={toggleSection}
        >
          <Codec />
          <CaptureScale />
        </Accordion>
      )}

      <Accordion
        id="adjustments"
        idPrefix={idPrefix}
        icon={<LuSlidersHorizontal size={16} />}
        title="Adjustments"
        badge={<AdjustmentsBadge />}
        isOpen={openSection === "adjustments"}
        onToggle={toggleSection}
      >
        {renderMode === "voxel" && <Voxel3DToggle />}

        {renderMode === "lines" && <LinesDirectionPicker />}

        <AdjustmentsContent />
      </Accordion>

      <Accordion
        id="effects"
        idPrefix={idPrefix}
        icon={<LuSparkles size={16} />}
        title="Effects"
        badge={<EffectsBadge />}
        isOpen={openSection === "effects"}
        onToggle={toggleSection}
      >
        <EffectsPanel />
      </Accordion>

      {renderMode === "ascii" && (
        <Accordion
          id="characterSet"
          idPrefix={idPrefix}
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
        idPrefix={idPrefix}
        icon={<LuPalette size={16} />}
        title="Appearance"
        badge={<AppearanceBadge />}
        isOpen={openSection === "appearance"}
        onToggle={toggleSection}
      >
        <AppearanceMode />
      </Accordion>

      {trailingSections.map(renderExtraSection)}
    </div>
  );
}

export default memo(SettingsSections);
