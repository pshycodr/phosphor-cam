import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import toast from "react-hot-toast";
import { BrowserRouter } from "react-router";

import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";

import { initNativeBack } from "@/shared/native/initNativeBack";

import App from "./App.tsx";

import "./styles/index.css";

if (process.env.NODE_ENV === "production") {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("[SW] registered"))
        .catch((err) => console.error("[SW] failed:", err));
    });
  }
}

if (Capacitor.getPlatform() === "android") {
  await StatusBar.hide();
}

initNativeBack({
  onExitHint: () => toast("Press back again to exit"),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
