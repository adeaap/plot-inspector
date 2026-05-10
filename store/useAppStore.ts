"use client";

import { create } from "zustand";
import { DEFAULT_IMAGERY_RELEASE } from "@/lib/tiles";
import type { Plot } from "@/types";

export const EUDR_CUTOFF_YEAR = 2021;
export const COMPLIANCE_THRESHOLD_HA = 0.05;

type FlyToTarget = {
  center: [number, number];
  zoom: number;
};

type AppState = {
  plot: Plot | null;
  showLossLayer: boolean;
  imageryReleaseId: string;
  flyToTarget: FlyToTarget | null;
  setPlot: (plot: Plot | null) => void;
  setShowLossLayer: (value: boolean) => void;
  setImageryReleaseId: (id: string) => void;
  setFlyToTarget: (target: FlyToTarget | null) => void;
  clearPlot: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  plot: null,
  showLossLayer: false,
  imageryReleaseId: DEFAULT_IMAGERY_RELEASE.id,
  flyToTarget: null,
  setPlot: (plot) => set({ plot }),
  setShowLossLayer: (value) => set({ showLossLayer: value }),
  setImageryReleaseId: (id) => set({ imageryReleaseId: id }),
  setFlyToTarget: (target) => set({ flyToTarget: target }),
  clearPlot: () => set({ plot: null }),
}));
