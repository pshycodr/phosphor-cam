import { memo } from "react";

import { Switch } from "@/shared/ui/controls";

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

const ToggleRow = ({
  label,
  description,
  checked,
  onChange,
}: ToggleRowProps) => {
  return (
    <div className="flex min-h-11 items-start justify-between gap-4">
      <span className="min-w-0">
        <span className="block text-xs font-medium text-paper">{label}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-faint">
          {description}
        </span>
      </span>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
};

export default memo(ToggleRow);
