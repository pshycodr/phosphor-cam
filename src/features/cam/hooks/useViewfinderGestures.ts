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
const PINCH_STEP = 1.12;

type Axis = "x" | "y" | "none" | null;

interface DragState {
  id: number;
  startX: number;
  startY: number;
  startTime: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  axis: Axis;
  moved: boolean;
}

const idleDrag = (): DragState => ({
  id: -1,
  startX: 0,
  startY: 0,
  startTime: 0,
  lastX: 0,
  lastY: 0,
  lastTime: 0,
  axis: null,
  moved: false,
});

interface GestureOptions {
  enabled: boolean;
  editorOpen: boolean;
  onFlip: () => void;
  onStepAspect: (direction: 1 | -1) => void;
  onStepRenderer: (direction: 1 | -1) => void;
  onOpenEditor: () => void;
  onCloseEditor: () => void;
}

/**
 * Additive phone gestures on the viewfinder: horizontal swipe steps the
 * renderer, vertical swipe opens or closes the editor, pinch steps the aspect
 * ratio, double-tap flips the camera. The chrome buttons stay the
 * discoverable path, so these never block one.
 */
export function useViewfinderGestures({
  enabled,
  editorOpen,
  onFlip,
  onStepAspect,
  onStepRenderer,
  onOpenEditor,
  onCloseEditor,
}: GestureOptions) {
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<DragState>(idleDrag());
  const pinch = useRef<{ distance: number; fired: boolean } | null>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    if (!enabled || editorOpen) lastTap.current = 0;
  }, [enabled, editorOpen]);

  const pinchDistance = () => {
    const [a, b] = [...pointers.current.values()];
    if (!a || !b) return 0;
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      pinch.current = editorOpen
        ? null
        : { distance: pinchDistance(), fired: false };
      drag.current = idleDrag();
      return;
    }

    if (pointers.current.size > 2) return;

    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTime: e.timeStamp,
      lastX: e.clientX,
      lastY: e.clientY,
      lastTime: e.timeStamp,
      axis: null,
      moved: false,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const gesture = pinch.current;
    if (gesture && pointers.current.size >= 2) {
      if (gesture.fired || gesture.distance < 1) return;

      const ratio = pinchDistance() / gesture.distance;

      if (ratio <= 1 / PINCH_STEP) {
        gesture.fired = true;
        onStepAspect(1);
      } else if (ratio >= PINCH_STEP) {
        gesture.fired = true;
        onStepAspect(-1);
      }
      return;
    }

    const d = drag.current;
    if (d.id !== e.pointerId) return;

    d.lastX = e.clientX;
    d.lastY = e.clientY;
    d.lastTime = e.timeStamp;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (Math.abs(dx) > TAP_SLOP || Math.abs(dy) > TAP_SLOP) d.moved = true;

    if (d.axis === null) {
      if (Math.abs(dx) <= DIRECTION_SLOP && Math.abs(dy) <= DIRECTION_SLOP)
        return;

      if (Math.abs(dx) > Math.abs(dy) * 1.2) d.axis = "x";
      else if (Math.abs(dy) > Math.abs(dx) * 1.2) d.axis = "y";
      else d.axis = "none";
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);

    if (pinch.current) {
      if (pointers.current.size < 2) pinch.current = null;
      drag.current = idleDrag();
      return;
    }

    const d = drag.current;
    if (d.id !== e.pointerId) return;
    drag.current = idleDrag();

    const dx = d.lastX - d.startX;
    const dy = d.lastY - d.startY;
    const elapsed = Math.max(1, d.lastTime - d.startTime);
    const speed = Math.abs(d.axis === "x" ? dx : dy) / elapsed;

    if (d.axis === "x") {
      if (editorOpen) return;

      if (Math.abs(dx) >= SWIPE_DISTANCE || speed >= SWIPE_VELOCITY) {
        lastTap.current = 0;
        onStepRenderer(dx < 0 ? 1 : -1);
      }
      return;
    }

    if (d.axis === "y") {
      if (dy < 0 && !editorOpen) {
        if (Math.abs(dy) >= SWIPE_DISTANCE || speed >= SWIPE_VELOCITY) {
          lastTap.current = 0;
          onOpenEditor();
        }
        return;
      }

      if (dy > 0 && editorOpen) {
        if (Math.abs(dy) >= SWIPE_DISTANCE || speed >= SWIPE_VELOCITY) {
          lastTap.current = 0;
          onCloseEditor();
        }
        return;
      }
    }

    if (d.moved) {
      lastTap.current = 0;
      return;
    }

    if (editorOpen) return;

    if (e.timeStamp - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      onFlip();
    } else {
      lastTap.current = e.timeStamp;
    }
  };

  const onPointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    drag.current = idleDrag();
  };

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
