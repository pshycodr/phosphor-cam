import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";

import App from "./App.tsx";

import "./index.css";

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
