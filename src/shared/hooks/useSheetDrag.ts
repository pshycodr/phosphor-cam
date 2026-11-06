import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
  useState,
} from "react";

const CLOSE_DRAG_PX = 80;

export function useSheetDrag(onClose: () => void) {
  const startY = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (startY.current === null) return;
    setOffset(Math.max(0, e.clientY - startY.current));
  }, []);

  const end = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (startY.current === null) return;
      const dragged = e.clientY - startY.current;
      startY.current = null;
      setOffset(0);
      if (dragged > CLOSE_DRAG_PX) onClose();
    },
    [onClose]
  );

  return {
    offset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    },
  };
}
