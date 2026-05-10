"use client";

import { Map } from "@/components/Map";
import { MapControls } from "@/components/MapControls";
import { ImageryPicker } from "@/components/ImageryPicker";
import { SearchByCoordinates } from "@/components/SearchByCoordinates";
import { ResultPanel } from "@/components/ResultPanel";
import { Tour, TourReplayButton } from "@/components/Tour";

export function Inspector() {
  return (
    <div className="relative flex flex-1 flex-col md:flex-row">
      <div className="relative flex-1 min-h-[60vh] md:min-h-0">
        <div className="absolute inset-0">
          <Map />
        </div>

        {/* Floating top toolbar */}
        <div className="pointer-events-none absolute left-0 right-0 top-3 flex flex-wrap justify-center gap-2 px-3">
          <MapControls />
        </div>

        {/* Floating bottom imagery toggle */}
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 flex justify-center px-3">
          <ImageryPicker />
        </div>

        {/* Branding strip + replay-tour button. The verbose chip is desktop-
            only, on mobile we keep just the help button so the top-left
            doesn't crowd the centered MapControls. */}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
          <div className="hidden rounded-full border border-black/10 bg-white/95 px-3 py-1 text-xs font-semibold tracking-tight text-zinc-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/95 dark:text-zinc-200 md:block">
            🌳 Plot Inspector{" "}
            <span className="font-normal text-zinc-500 dark:text-zinc-400">
              · EUDR demo
            </span>
          </div>
          <TourReplayButton />
        </div>
      </div>

      <aside className="flex w-full flex-col gap-4 border-t border-black/5 bg-white p-5 dark:border-white/10 dark:bg-zinc-950 md:order-first md:w-[380px] md:border-r md:border-t-0">
        <ResultPanel inputsSlot={<SearchByCoordinates />} />
        <Footer />
      </aside>

      <Tour />
    </div>
  );
}

function Footer() {
  return (
    <p className="mt-auto pt-4 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
      Forest-loss data:{" "}
      <a
        href="https://glad.umd.edu/dataset/global-2010-tree-cover-30-m"
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dotted underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        Hansen Global Forest Change
      </a>
      , served via{" "}
      <a
        href="https://www.globalforestwatch.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dotted underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        GFW
      </a>
      . This is a demo, not a regulated EUDR diligence service.
    </p>
  );
}
