import { FaGithub } from "react-icons/fa";

import { VERSION } from "../constants/version";

export function AboutCard() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src="/assets/logo.png"
          alt="Phosphor Cam"
          className="size-8 rounded-lg object-contain"
        />

        <div className="leading-tight">
          <p className="text-sm font-medium text-green-400">Phosphor Cam</p>
          <p className="text-[10px] text-green-500/50">{VERSION}</p>
        </div>
      </div>

      <a
        href="https://github.com/pshycodr/phosphor-cam"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Phosphor Cam on GitHub"
        className="rounded-lg p-2 text-green-400/70 transition-colors hover:bg-green-500/10 hover:text-green-400 focus-visible:ring-2 focus-visible:ring-green-400/60 focus-visible:outline-none"
      >
        <FaGithub size={20} />
      </a>
    </div>
  );
}
