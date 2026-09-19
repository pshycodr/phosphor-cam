import { memo } from "react";

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
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-green-300">
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-green-500/60">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="settings-toggle mt-0.5 shrink-0"
      />
    </label>
  );
};

export default memo(ToggleRow);
