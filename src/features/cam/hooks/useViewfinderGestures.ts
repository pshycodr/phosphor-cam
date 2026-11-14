import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
} from "react";

const SWIPE_DISTANCE = 48;
const SWIPE_VELOCITY = 0.35;
const DIRECTION_SLOP = 12;
const TAP_SLOP = 12;
const DOUBLE_TAP_MS = 320;

interface GestureOptions {
  onFlip: () => void;
  onCycleAspect: (direction: 1 | -1) => void;
  enabled: boolean;
}

/**
 * Additive phone gestures on the viewfinder: swipe sideways for the next
 * aspect ratio, double-tap to flip the camera. The chrome buttons stay the
 * discoverable path, so these never block one.
 */
export function useViewfinderGestures({
  onFlip,
  onCycleAspect,
  enabled,
}: GestureOptions) {
  const drag = useRef({
    id: -1,
    startX: 0,
    startY: 0,
    startTime: 0,
    lastX: 0,
    lastTime: 0,
    horizontal: false,
    moved: false,
    fired: false,
  });
  const lastTap = useRef(0);

  useEffect(() => {
    if (!enabled) lastTap.current = 0;
  }, [enabled]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || !e.isPrimary) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTime: e.timeStamp,
      lastX: e.clientX,
      lastTime: e.timeStamp,
      horizontal: false,
      moved: false,
      fired: false,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;

    d.lastX = e.clientX;
    d.lastTime = e.timeStamp;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (Math.abs(dx) > TAP_SLOP || Math.abs(dy) > TAP_SLOP) d.moved = true;
    if (Math.abs(dx) > DIRECTION_SLOP && Math.abs(dx) > Math.abs(dy) * 1.2) {
      d.horizontal = true;
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    d.id = -1;

    const dx = d.lastX - d.startX;
    const elapsed = Math.max(1, d.lastTime - d.startTime);
    const velocity = Math.abs(dx) / elapsed;

    if (d.horizontal && !d.fired) {
      if (Math.abs(dx) >= SWIPE_DISTANCE || velocity >= SWIPE_VELOCITY) {
        d.fired = true;
        onCycleAspect(dx < 0 ? 1 : -1);
        lastTap.current = 0;
        return;
      }
    }

    if (d.moved) {
      lastTap.current = 0;
      return;
    }

    if (e.timeStamp - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      onFlip();
    } else {
      lastTap.current = e.timeStamp;
    }
  };

  const onPointerCancel = () => {
    drag.current.id = -1;
  };

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
