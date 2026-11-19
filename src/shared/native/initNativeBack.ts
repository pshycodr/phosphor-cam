import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

import { runTopBackHandler } from "./backStack";

const EXIT_WINDOW_MS = 2000;

interface NativeBackOptions {
  onExitHint: () => void;
}

let started = false;

/**
 * Android back: close the top surface, walk WebView history back, or ask for
 * a second press before leaving the app.
 */
export function initNativeBack({ onExitHint }: NativeBackOptions) {
  if (started || Capacitor.getPlatform() !== "android") return;

  started = true;

  let exitArmedAt = 0;

  void App.addListener("backButton", ({ canGoBack }) => {
    if (runTopBackHandler()) {
      exitArmedAt = 0;
      return;
    }

    if (canGoBack) {
      exitArmedAt = 0;
      window.history.back();
      return;
    }

    const now = Date.now();

    if (now - exitArmedAt < EXIT_WINDOW_MS) {
      exitArmedAt = 0;
      void App.exitApp();
      return;
    }

    exitArmedAt = now;
    onExitHint();
  });
}
