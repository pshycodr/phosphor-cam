import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";

import Cam from "./features/cam";
import StudioPage from "./features/studio";

const StudioEditorPage = lazy(
  () => import("./features/studio/StudioEditorPage")
);

function StudioEditorFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-ink text-faint select-none">
      <span className="font-mono text-[10px] tracking-[0.18em] uppercase">
        Loading studio…
      </span>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Cam />} />
      <Route path="/studio" element={<StudioPage />} />
      <Route
        path="/studio/edit"
        element={
          <Suspense fallback={<StudioEditorFallback />}>
            <StudioEditorPage />
          </Suspense>
        }
      />
    </Routes>
  );
}
