import { create } from "zustand";

import { createDefaultSettings } from "@/shared/constants/defaultSettings";
import type {
  AsciiSettings,
  EffectKey,
  EffectProps,
  EffectsSettings,
} from "@/shared/types";

import type { StudioWorkerController } from "../worker/StudioWorkerController";

export interface LoadedImage {
  file: File | null;
  url: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
}

interface StudioState {
  image: LoadedImage | null;
  settings: AsciiSettings;
  history: AsciiSettings[];
  historyIndex: number;
  zoom: number;
  pan: { x: number; y: number };
  isComparing: boolean;
  isExportModalOpen: boolean;
  workerController: StudioWorkerController | null;

  // Actions
  setWorkerController: (controller: StudioWorkerController | null) => void;
  loadImage: (
    file: File | null,
    url: string,
    name: string,
    width: number,
    height: number
  ) => void;
  clearImage: () => void;
  updateSettings: (
    patch: Partial<AsciiSettings>,
    recordHistory?: boolean
  ) => void;
  updateEffect: (
    key: EffectKey,
    patch: Partial<EffectProps>,
    recordHistory?: boolean
  ) => void;
  applyPreset: (presetSettings: Partial<AsciiSettings>) => void;
  resetSettings: () => void;
  undo: () => void;
  redo: () => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPan: (
    pan:
      | { x: number; y: number }
      | ((prev: { x: number; y: number }) => { x: number; y: number })
  ) => void;
  resetZoomAndPan: () => void;
  setIsComparing: (comparing: boolean) => void;
  setIsExportModalOpen: (open: boolean) => void;
}

const MAX_HISTORY = 30;

function cloneSettings(s: AsciiSettings): AsciiSettings {
  return JSON.parse(JSON.stringify(s));
}

export const useStudioStore = create<StudioState>((set, get) => ({
  image: null,
  settings: createDefaultSettings(),
  history: [createDefaultSettings()],
  historyIndex: 0,
  zoom: 1,
  pan: { x: 0, y: 0 },
  isComparing: false,
  isExportModalOpen: false,
  workerController: null,

  setWorkerController: (c) => set({ workerController: c }),

  loadImage: (file, url, name, width, height) => {
    const previous = get().image;
    if (previous?.url.startsWith("blob:") && previous.url !== url) {
      URL.revokeObjectURL(previous.url);
    }

    set({
      image: {
        file,
        url,
        name,
        width,
        height,
        aspectRatio: width / height,
      },
      zoom: 1,
      pan: { x: 0, y: 0 },
    });
  },

  clearImage: () => {
    const current = get().image;
    if (current?.url.startsWith("blob:")) {
      URL.revokeObjectURL(current.url);
    }
    set({
      image: null,
      zoom: 1,
      pan: { x: 0, y: 0 },
    });
  },

  updateSettings: (patch, recordHistory = true) => {
    const prev = get().settings;
    const next: AsciiSettings = { ...prev, ...patch };

    if (!recordHistory) {
      set({ settings: next });
      return;
    }

    const { history, historyIndex } = get();
    const truncatedHistory = history.slice(0, historyIndex + 1);
    const newHistory = [...truncatedHistory, cloneSettings(next)].slice(
      -MAX_HISTORY
    );

    set({
      settings: next,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  updateEffect: (key, patch, recordHistory = true) => {
    const prev = get().settings;
    const currentEffect = prev.effects[key];
    const nextEffects: EffectsSettings = {
      ...prev.effects,
      [key]: { ...currentEffect, ...patch },
    };
    get().updateSettings({ effects: nextEffects }, recordHistory);
  },

  applyPreset: (presetSettings) => {
    const prev = get().settings;
    const next: AsciiSettings = {
      ...prev,
      ...presetSettings,
      effects: {
        ...prev.effects,
        ...(presetSettings.effects || {}),
      },
      color: {
        ...prev.color,
        ...(presetSettings.color || {}),
      },
    };

    const { history, historyIndex } = get();
    const truncatedHistory = history.slice(0, historyIndex + 1);
    const newHistory = [...truncatedHistory, cloneSettings(next)].slice(
      -MAX_HISTORY
    );

    set({
      settings: next,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  resetSettings: () => {
    const next = createDefaultSettings();
    const { history, historyIndex } = get();
    const truncatedHistory = history.slice(0, historyIndex + 1);
    const newHistory = [...truncatedHistory, next].slice(-MAX_HISTORY);

    set({
      settings: next,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      set({
        settings: cloneSettings(history[nextIndex]),
        historyIndex: nextIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({
        settings: cloneSettings(history[nextIndex]),
        historyIndex: nextIndex,
      });
    }
  },

  setZoom: (updater) =>
    set((state) => ({
      zoom: typeof updater === "function" ? updater(state.zoom) : updater,
    })),

  setPan: (updater) =>
    set((state) => ({
      pan: typeof updater === "function" ? updater(state.pan) : updater,
    })),

  resetZoomAndPan: () => set({ zoom: 1, pan: { x: 0, y: 0 } }),

  setIsComparing: (comparing) => set({ isComparing: comparing }),

  setIsExportModalOpen: (open) => set({ isExportModalOpen: open }),
}));
