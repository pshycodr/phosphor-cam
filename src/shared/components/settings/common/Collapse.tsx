import { memo, type ReactNode } from "react";

interface CollapseProps {
  open: boolean;
  id?: string;
  labelledBy?: string;
  children: ReactNode;
}

const Collapse = ({ open, id, labelledBy, children }: CollapseProps) => (
  <div
    id={id}
    role={labelledBy ? "region" : undefined}
    aria-labelledby={labelledBy}
    className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none ${
      open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
    }`}
  >
    <div className="-mx-1 min-h-0 overflow-hidden px-1">{children}</div>
  </div>
);

export default memo(Collapse);
