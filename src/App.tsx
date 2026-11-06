import { Route, Routes } from "react-router";

import Cam from "./features/cam";
import StudioPage from "./features/studio";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Cam />} />
      <Route path="/studio" element={<StudioPage />} />
    </Routes>
  );
}
