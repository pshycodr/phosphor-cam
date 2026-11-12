import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";

const DISMISS_PX = 96;
const DISMISS_VELOCITY = 0.6;

interface DragState {
  startY: number;
  startTime: number;
  lastY: number;
  lastTime: number;
  dragging: boolean;
}

export function useSheetDrag(onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const state = useRef<DragState>({
    startY: 0,
    startTime: 0,
    lastY: 0,
    lastTime: 0,
    dragging: false,
  });
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const setTransform = useCallback((y: number, animate: boolean) => {
    const el = panelRef.current;
    if (!el) return;
    el.style.transition = animate
      ? "transform 220ms cubic-bezier(0.23, 1, 0.32, 1)"
      : "none";
    el.style.transform = y > 0 ? `translateY(${y}px)` : "";
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      clearTimeout(closeTimer.current);
      state.current = {
        startY: e.clientY,
        startTime: e.timeStamp,
        lastY: e.clientY,
        lastTime: e.timeStamp,
        dragging: true,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      setTransform(0, false);
    },
    [setTransform]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = state.current;
      if (!drag.dragging) return;
      drag.lastY = e.clientY;
      drag.lastTime = e.timeStamp;
      setTransform(Math.max(0, e.clientY - drag.startY), false);
    },
    [setTransform]
  );

  const end = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = state.current;
      if (!drag.dragging) return;
      drag.dragging = false;

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      const distance = Math.max(0, drag.lastY - drag.startY);
      const elapsed = Math.max(1, drag.lastTime - drag.startTime);
      const velocity = distance / elapsed;

      if (distance > DISMISS_PX || velocity > DISMISS_VELOCITY) {
        const el = panelRef.current;
        if (el) {
          const height = el.getBoundingClientRect().height;
          setTransform(height, true);
        }
        closeTimer.current = setTimeout(() => {
          setTransform(0, false);
          onClose();
        }, 200);
        return;
      }

      setTransform(0, true);
    },
    [onClose, setTransform]
  );

  return {
    panelRef,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    },
  };
}
