type BackHandler = () => void;

const handlers: BackHandler[] = [];

/** Registers a back handler; the most recently registered one runs first. */
export function pushBackHandler(handler: BackHandler) {
  handlers.push(handler);

  return () => {
    const index = handlers.lastIndexOf(handler);
    if (index !== -1) handlers.splice(index, 1);
  };
}

/** Runs the top handler. Returns false when nothing is registered. */
export function runTopBackHandler() {
  const handler = handlers[handlers.length - 1];
  if (!handler) return false;

  handler();
  return true;
}
