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
    <div className="border-b border-line/70 last:border-b-0">
      <button
        id={triggerId}
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left"
      >
        <span className="flex items-center gap-2.5">
          <span
            className={`transition-colors ${
              isOpen ? "text-signal" : "text-faint group-hover:text-muted"
            }`}
          >
            {icon}
          </span>
          <span className="text-[11px] font-medium tracking-[0.14em] text-paper uppercase">
            {title}
          </span>
        </span>

        <span className="flex min-w-0 items-center gap-2">
          {badge && (
            <span className="flex min-w-0 items-center gap-1.5 truncate font-mono text-[10px] text-faint tabular-nums">
              {badge}
            </span>
          )}
          <LuChevronDown
            size={15}
            aria-hidden="true"
            className={`shrink-0 text-faint transition-transform duration-200 ease-[var(--ease-out)] group-hover:text-muted motion-reduce:transition-none ${
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
