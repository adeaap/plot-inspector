"use client";

import { IMAGERY_RELEASES } from "@/lib/tiles";
import { useAppStore } from "@/store/useAppStore";

export function ImageryPicker() {
  const imageryReleaseId = useAppStore((s) => s.imageryReleaseId);
  const setImageryReleaseId = useAppStore((s) => s.setImageryReleaseId);

  return (
    <div
      role="radiogroup"
      aria-label="Compare imagery"
      data-tour-id="imagery"
      className="pointer-events-auto inline-flex items-stretch gap-1 rounded-full border border-black/10 bg-white/95 p-1 shadow-md backdrop-blur dark:border-white/10 dark:bg-zinc-900/95"
    >
      {IMAGERY_RELEASES.map((release) => {
        const active = release.id === imageryReleaseId;
        return (
          <button
            key={release.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setImageryReleaseId(release.id)}
            className={`flex min-w-[7.5rem] cursor-pointer flex-col items-center gap-0.5 rounded-full px-4 py-1.5 transition-colors ${
              active
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-zinc-700 hover:bg-black/[0.04] dark:text-zinc-200 dark:hover:bg-white/10"
            }`}
          >
            <span className="text-xs font-semibold leading-tight">
              {release.label}
            </span>
            {release.hint ? (
              <span
                className={`text-[10px] uppercase leading-tight tracking-wider ${
                  active
                    ? "text-emerald-100"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {release.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
