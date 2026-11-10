import { memo } from "react";
import { LuChevronDown } from "react-icons/lu";

import Collapse from "../common/Collapse";

interface AccordionSectionProps {
  id: string;
  idPrefix?: string;
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

const Accordion = ({
  id,
  idPrefix = "settings",
  icon,
  title,
  badge,
  isOpen,
  onToggle,
  children,
}: AccordionSectionProps) => {
  const triggerId = `${idPrefix}-trigger-${id}`;
  const panelId = `${idPrefix}-section-${id}`;

  return (
    <div className="border-b border-green-500/15 last:border-b-0">
      <button
        id={triggerId}
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group flex min-h-14 w-full items-center justify-between gap-3 rounded-md py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-green-400/70"
      >
        <span className="flex items-center gap-2.5 text-green-400 transition-colors group-hover:text-green-300">
          {icon}
          <span className="text-sm font-semibold">{title}</span>
        </span>

        <span className="flex min-w-0 items-center gap-2">
          {badge && (
            <span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-green-500/70">
              {badge}
            </span>
          )}
          <LuChevronDown
            size={16}
            aria-hidden="true"
            className={`shrink-0 text-green-500/60 transition-transform duration-200 motion-reduce:transition-none ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <Collapse id={panelId} labelledBy={triggerId} open={isOpen}>
        <div className="space-y-5 pt-1 pb-5">{children}</div>
      </Collapse>
    </div>
  );
};

export default memo(Accordion);
