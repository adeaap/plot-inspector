"use client";

import { create } from "zustand";

type TourState = {
  isOpen: boolean;
  step: number;
  open: (step?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
};

export const useTourStore = create<TourState>((set) => ({
  isOpen: false,
  step: 0,
  open: (step = 0) => set({ isOpen: true, step }),
  close: () => set({ isOpen: false }),
  next: () => set((s) => ({ step: s.step + 1 })),
  prev: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  goTo: (step) => set({ step }),
}));

export function shouldAutoOpenTour(): boolean {
  return typeof window !== "undefined";
}
