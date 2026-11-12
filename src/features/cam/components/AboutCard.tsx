import { FaGithub } from "react-icons/fa";

import { VERSION } from "../constants/version";

export function AboutCard() {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <img
          src="/assets/logo.png"
          alt=""
          className="size-8 shrink-0 rounded-lg object-contain"
        />

        <div className="min-w-0 leading-tight">
          <p className="truncate text-xs font-medium text-paper">
            Phosphor Cam
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-faint tabular-nums">
            {VERSION}
          </p>
        </div>
      </div>

      <a
        href="https://github.com/pshycodr/phosphor-cam"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Phosphor Cam on GitHub"
        className="press flex size-9 shrink-0 items-center justify-center rounded-full text-faint hover:bg-ink-3 hover:text-paper"
      >
        <FaGithub size={18} aria-hidden="true" />
      </a>
    </div>
  );
}
