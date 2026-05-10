"use client";

import { useAppStore } from "@/store/useAppStore";

export function MapControls() {
  const plot = useAppStore((s) => s.plot);
  const clearPlot = useAppStore((s) => s.clearPlot);
  const showLossLayer = useAppStore((s) => s.showLossLayer);
  const setShowLossLayer = useAppStore((s) => s.setShowLossLayer);

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-full border border-black/10 bg-white/95 px-2 py-1.5 text-sm shadow-md backdrop-blur dark:border-white/10 dark:bg-zinc-900/95">
      <label
        data-tour-id="overlay"
        className="inline-flex h-8 cursor-pointer select-none items-center gap-2 rounded-full px-2 text-zinc-700 dark:text-zinc-200"
      >
        <input
          type="checkbox"
          checked={showLossLayer}
          onChange={(e) => setShowLossLayer(e.target.checked)}
          className="h-3.5 w-3.5 accent-emerald-600"
        />
        Forest-loss overlay
      </label>

      {plot ? (
        <>
          <span className="mx-1 hidden h-4 w-px bg-black/10 dark:bg-white/15 sm:block" />
          <button
            type="button"
            onClick={clearPlot}
            className="inline-flex h-8 items-center rounded-full border border-black/10 px-3 font-medium text-zinc-700 transition-colors hover:bg-black/[0.04] dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Clear
          </button>
        </>
      ) : null}
    </div>
  );
}
