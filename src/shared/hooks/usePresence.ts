import { useEffect, useState } from "react";

/** Keeps an element mounted long enough to play its exit transition. */
export function usePresence(open: boolean, exitMs = 180) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(frame);
    }

    const timer = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(timer);
  }, [open, exitMs]);

  return open || mounted;
}
