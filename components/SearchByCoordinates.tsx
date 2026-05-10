"use client";

import { useId, useState } from "react";
import { z } from "zod";
import { circlePolygon, SEARCH_RADIUS_KM } from "@/lib/geometry";
import { useAppStore } from "@/store/useAppStore";

const formSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export function SearchByCoordinates() {
  const latId = useId();
  const lngId = useId();
  const setPlot = useAppStore((s) => s.setPlot);
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = formSchema.safeParse({
      lat: Number(lat),
      lng: Number(lng),
    });
    if (!parsed.success) {
      setError(
        "Enter a valid latitude (−90 to 90) and longitude (−180 to 180).",
      );
      return;
    }

    const center: [number, number] = [parsed.data.lng, parsed.data.lat];
    const geometry = circlePolygon(center, SEARCH_RADIUS_KM);
    setPlot({
      id: `coord-${Date.now()}`,
      geometry,
      center,
      radiusKm: SEARCH_RADIUS_KM,
      label: `${parsed.data.lat.toFixed(4)}°, ${parsed.data.lng.toFixed(4)}°`,
    });
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        data-tour-id="search"
        className="inline-flex h-8 w-fit cursor-pointer items-center gap-1.5 rounded-full border border-black/10 bg-white/95 px-3 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-black/[0.04] dark:border-white/15 dark:bg-zinc-900/95 dark:text-zinc-200 dark:hover:bg-white/10"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="10" r="3" />
          <path d="M12 21s-7-7.58-7-12a7 7 0 0114 0c0 4.42-7 12-7 12z" />
        </svg>
        Search by coordinates
      </button>

      {open ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 rounded-lg border border-black/10 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.04]"
        >
          <div className="grid grid-cols-2 gap-2">
            <label
              htmlFor={latId}
              className="flex flex-col gap-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Latitude
              <input
                id={latId}
                type="number"
                step="any"
                inputMode="decimal"
                placeholder="-3.4653"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="h-8 rounded-md border border-black/10 bg-white px-2 font-mono text-sm tabular-nums text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
                required
              />
            </label>
            <label
              htmlFor={lngId}
              className="flex flex-col gap-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Longitude
              <input
                id={lngId}
                type="number"
                step="any"
                inputMode="decimal"
                placeholder="-62.2159"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="h-8 rounded-md border border-black/10 bg-white px-2 font-mono text-sm tabular-nums text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
                required
              />
            </label>
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Searches a {SEARCH_RADIUS_KM} km radius around the entered point.
          </p>

          {error ? (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <button
            type="submit"
            className="inline-flex h-8 w-fit items-center rounded-full bg-emerald-600 px-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            Search
          </button>
        </form>
      ) : null}
    </div>
  );
}
