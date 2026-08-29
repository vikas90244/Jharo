"use client";

import { create } from "zustand";

interface ZoomState {
  isZoomed: boolean;
  setZoomed: (zoomed: boolean) => void;
  toggleZoom: () => void;
}

export const useZoomState = create<ZoomState>((set) => ({
  isZoomed: false,
  setZoomed: (zoomed) => set({ isZoomed: zoomed }),
  toggleZoom: () => set((state) => ({ isZoomed: !state.isZoomed })),
}));
