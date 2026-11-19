import { useEffect, useRef } from "react";

import { pushBackHandler } from "@/shared/native/backStack";

/** Routes Android back presses to `onBack` while `active` is true. */
export function useBackHandler(active: boolean, onBack: () => void) {
  const handler = useRef(onBack);

  useEffect(() => {
    handler.current = onBack;
  });

  useEffect(() => {
    if (!active) return;

    return pushBackHandler(() => handler.current());
  }, [active]);
}
