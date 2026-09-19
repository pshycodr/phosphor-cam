import { memo, useLayoutEffect, useRef, useState } from "react";
import { LuChevronDown } from "react-icons/lu";

import type { SectionId } from "./contants";

interface AccordionSectionProps {
  id: SectionId;
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  isOpen: boolean;
  onToggle: (id: SectionId) => void;
  children: React.ReactNode;
}

const Accordion = ({
  id,
  icon,
  title,
  badge,
  isOpen,
  onToggle,
  children,
}: AccordionSectionProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const measure = () => setMaxHeight(node.scrollHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [isOpen, children]);

  return (
    <div className="border-b border-green-500/15 last:border-b-0">
      <button
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        aria-controls={`settings-section-${id}`}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <span className="flex items-center gap-2.5 text-green-400">
          {icon}
          <span className="text-sm font-semibold">{title}</span>
        </span>
        <span className="flex min-w-0 items-center gap-2">
          {badge && (
            <span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-green-500/60">
              {badge}
            </span>
          )}
          <LuChevronDown
            size={16}
            className={`shrink-0 text-green-500/50 transition-transform duration-200 motion-reduce:transition-none ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <div
        id={`settings-section-${id}`}
        style={{ maxHeight: isOpen ? maxHeight : 0 }}
        className="overflow-hidden transition-[max-height] duration-300 ease-out motion-reduce:transition-none"
      >
        <div ref={contentRef} className="space-y-5 pb-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default memo(Accordion);
