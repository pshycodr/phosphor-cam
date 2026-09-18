import { create } from "zustand";

import type { ProcessingStats } from "@/types";

interface StatsStore extends ProcessingStats {
  setStats: (s: ProcessingStats) => void;
}

export const useStatsStore = create<StatsStore>((set) => ({
  fps: 0,
  renderTime: 0,
  setStats: (s) => set(s),
}));
