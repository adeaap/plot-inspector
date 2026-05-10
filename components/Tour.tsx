"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { circlePolygon, SEARCH_RADIUS_KM } from "@/lib/geometry";
import { IMAGERY_RELEASES } from "@/lib/tiles";
import { useAppStore } from "@/store/useAppStore";
import { shouldAutoOpenTour, useTourStore } from "@/store/useTourStore";

const COFFEE_CENTER: [number, number] = [
  -45.794405444722244, -20.91167810125851,
];

const [BASELINE_RELEASE, LATEST_RELEASE] = IMAGERY_RELEASES;

type Placement = "top" | "bottom" | "left" | "right" | "center";

type Step = {
  target: string | null;
  placement: Placement;
  body: ReactNode;
  primaryLabel?: string;
  primaryAction?: () => void;
  /** When true, the popover footer hides Next/primary, the body owns its own advance. */
  hideAdvance?: boolean;
};

function useSteps(): Step[] {
  const setPlot = useAppStore((s) => s.setPlot);
  const setFlyToTarget = useAppStore((s) => s.setFlyToTarget);
  const setShowLossLayer = useAppStore((s) => s.setShowLossLayer);
  const goTo = useTourStore((s) => s.goTo);
  const next = useTourStore((s) => s.next);

  const tryCoffee = () => {
    const geometry = circlePolygon(COFFEE_CENTER, SEARCH_RADIUS_KM);
    setPlot({
      id: `coord-${Date.now()}`,
      geometry,
      center: COFFEE_CENTER,
      radiusKm: SEARCH_RADIUS_KM,
      label: `${COFFEE_CENTER[1].toFixed(4)}°, ${COFFEE_CENTER[0].toFixed(4)}°`,
    });
    goTo(2);
  };

  const advanceFromWelcome = () => {
    // Prewarm tiles for the Minas Gerais example so the basemap and Hansen
    // overlay are already loading by the time the user reaches step 2.
    setFlyToTarget({ center: COFFEE_CENTER, zoom: 15 });
    // Reveal the Hansen forest-loss overlay now that the user is entering
    // the interactive part of the tour.
    setShowLossLayer(true);
    next();
  };

  return [
    {
      target: null,
      placement: "center",
      body: (
        <>
          <h2 className="text-lg font-semibold tracking-tight">
            Welcome to Plot Inspector
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Pick any latitude/longitude on Earth and we&apos;ll draw a 1 km
            circle around it, then check whether the area has lost tree cover
            since the EU Deforestation Regulation (EUDR) cutoff (Dec 2020).
          </p>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
            Built by{" "}
            <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
              Adea Pistulli
            </strong>
            .
          </p>
        </>
      ),
      primaryLabel: "Next",
      primaryAction: advanceFromWelcome,
    },
    {
      target: "[data-tour-id='search']",
      placement: "right",
      body: (
        <>
          <h2 className="text-lg font-semibold tracking-tight">
            Search by coordinates
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Open the form, type any lat/lng, and we&apos;ll pull tree-cover-loss
            stats for a 1 km radius around it.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Try the example plot at{" "}
            <span className="whitespace-nowrap font-mono text-xs text-zinc-700 dark:text-zinc-300">
              −20.9117°, −45.7944°
            </span>{" "}
            , deep in{" "}
            <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
              Minas Gerais, Brazil
            </strong>
            , one of the world&apos;s biggest coffee-exporting regions. Brazil
            supplies about 30% of global coffee exports, the bulk of it grown
            right here.
          </p>
        </>
      ),
      primaryLabel: "Try a Minas Gerais coffee plot",
      primaryAction: tryCoffee,
    },
    {
      target: "[data-tour-id='imagery']",
      placement: "top",
      body: (
        <>
          <h2 className="text-lg font-semibold tracking-tight">
            Compare before & after
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            The bottom toggle switches between{" "}
            <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
              {BASELINE_RELEASE.label}
            </strong>{" "}
            (the EUDR baseline) and{" "}
            <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
              {LATEST_RELEASE.label}
            </strong>
            . Flip it any time to spot tree-cover gaps that opened up inside
            your plot since the cutoff.
          </p>
        </>
      ),
    },
    {
      target: "[data-tour-id='overlay']",
      placement: "bottom",
      body: (
        <>
          <h2 className="text-lg font-semibold tracking-tight">
            Forest-loss overlay
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Red splotches mark where Hansen / Global Forest Watch detected
            tree-cover loss since 2001, a global heat map of where deforestation
            has been concentrated.
          </p>
        </>
      ),
    },
  ];
}

export function Tour() {
  const isOpen = useTourStore((s) => s.isOpen);
  const step = useTourStore((s) => s.step);
  const open = useTourStore((s) => s.open);
  const close = useTourStore((s) => s.close);
  const next = useTourStore((s) => s.next);
  const prev = useTourStore((s) => s.prev);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const steps = useSteps();
  const safeStep = Math.min(step, steps.length - 1);
  const current = steps[safeStep];
  const isLast = safeStep >= steps.length - 1;
  const isFirst = safeStep === 0;

  // Auto-open on first visit.
  useEffect(() => {
    if (shouldAutoOpenTour()) open(0);
  }, [open]);

  // Track viewport size, at narrow widths we override desktop placements
  // (left/right) since a 343px popover never fits beside a target.
  useEffect(() => {
    const update = () => setIsCompact(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Track target element bounds; re-measure on resize, scroll, and after a
  // short tick so the rect catches up with newly mounted elements.
  const target = current.target;
  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      if (!target) {
        setRect(null);
        return;
      }
      const el = document.querySelector(target);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    update();
    if (!target) return;
    // On mobile the target is often in the aside below the map, scroll it
    // into view before placing the popover.
    const el = document.querySelector(target);
    if (el && "scrollIntoView" in el) {
      (el as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    const settle = window.setTimeout(update, 400);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen, target]);

  // Escape closes the tour.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const showSpotlight = !!(rect && current.target);
  const handleNext = () => {
    if (isLast) close();
    else next();
  };

  const margin = 16;
  // On mobile, fold left/right placements into top/bottom (a 343px popover
  // can't fit beside a target) and pick whichever side has more room.
  let placement: Placement = current.placement;
  if (isCompact && rect && placement !== "center") {
    const targetMidY = rect.top + rect.height / 2;
    const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
    placement = targetMidY > viewportH / 2 ? "top" : "bottom";
  }

  const popoverStyle: CSSProperties = {};
  if (placement === "center" || !rect) {
    popoverStyle.top = "50%";
    popoverStyle.left = "50%";
    popoverStyle.transform = "translate(-50%, -50%)";
  } else if (placement === "bottom") {
    popoverStyle.top = `${rect.bottom + margin}px`;
    popoverStyle.left = `${rect.left + rect.width / 2}px`;
    popoverStyle.transform = "translateX(-50%)";
  } else if (placement === "top") {
    popoverStyle.top = `${rect.top - margin}px`;
    popoverStyle.left = `${rect.left + rect.width / 2}px`;
    popoverStyle.transform = "translate(-50%, -100%)";
  } else if (placement === "left") {
    popoverStyle.top = `${rect.top + rect.height / 2}px`;
    popoverStyle.left = `${rect.left - margin}px`;
    popoverStyle.transform = "translate(-100%, -50%)";
  } else if (placement === "right") {
    popoverStyle.top = `${rect.top + rect.height / 2}px`;
    popoverStyle.left = `${rect.right + margin}px`;
    popoverStyle.transform = "translateY(-50%)";
  }

  // Clamp horizontally so the 343px popover never overflows the viewport
  // when the target sits near an edge.
  if (
    typeof window !== "undefined" &&
    rect &&
    (placement === "top" || placement === "bottom")
  ) {
    const popoverWidth = Math.min(360, window.innerWidth - 32);
    const halfPopover = popoverWidth / 2;
    const targetCenterX = rect.left + rect.width / 2;
    const minLeft = halfPopover + 16;
    const maxLeft = window.innerWidth - halfPopover - 16;
    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, targetCenterX));
    popoverStyle.left = `${clampedLeft}px`;
  }

  return (
    <>
      {/* Click absorber, invisible but soaks up clicks behind the popover. */}
      <div className="fixed inset-0 z-40" aria-hidden />

      {/* Visual layer: spotlight cutout (with shadow-backdrop) or plain backdrop. */}
      {showSpotlight && rect ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 rounded-lg ring-2 ring-emerald-400 transition-all duration-200"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.62)",
          }}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-50 bg-black/60"
        />
      )}

      {/* Popover */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Plot Inspector tour"
        className="fixed z-[60] w-[min(360px,calc(100vw-32px))] rounded-xl border border-black/10 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-zinc-900"
        style={popoverStyle}
      >
        {current.body}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-2 gap-y-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {safeStep + 1} / {steps.length}
          </span>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Skip
            </button>
            {!isFirst ? (
              <button
                type="button"
                onClick={prev}
                className="inline-flex h-8 cursor-pointer items-center rounded-full border border-black/10 px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-black/[0.04] dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                Back
              </button>
            ) : null}
            {current.hideAdvance ? null : current.primaryAction ? (
              <button
                type="button"
                onClick={current.primaryAction}
                className="inline-flex h-8 cursor-pointer items-center rounded-full bg-emerald-600 px-3 text-xs font-medium text-white transition-colors hover:bg-emerald-500"
              >
                {current.primaryLabel}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex h-8 cursor-pointer items-center rounded-full bg-emerald-600 px-3 text-xs font-medium text-white transition-colors hover:bg-emerald-500"
              >
                {isLast ? "Done" : "Next"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function TourReplayButton() {
  const open = useTourStore((s) => s.open);
  return (
    <button
      type="button"
      onClick={() => open(0)}
      aria-label="Replay tour"
      title="Replay tour"
      className="pointer-events-auto inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white/95 text-sm font-semibold text-zinc-600 shadow-sm backdrop-blur transition-colors hover:bg-black/[0.04] dark:border-white/10 dark:bg-zinc-900/95 dark:text-zinc-300 dark:hover:bg-white/10"
    >
      ?
    </button>
  );
}
