"use client";

import {
  useAppStore,
  EUDR_CUTOFF_YEAR,
  COMPLIANCE_THRESHOLD_HA,
} from "@/store/useAppStore";
import { trpc } from "@/trpc/client";
import { formatHa, formatPct } from "@/lib/geometry";

type Props = {
  inputsSlot?: React.ReactNode;
};

export function ResultPanel({ inputsSlot }: Props) {
  const plot = useAppStore((s) => s.plot);

  const query = trpc.deforestation.queryByPolygon.useQuery(
    plot
      ? { geometry: plot.geometry, sinceYear: EUDR_CUTOFF_YEAR }
      : (undefined as never),
    {
      enabled: !!plot,
    },
  );

  if (!plot) {
    return (
      <EmptyState>
        <h2 className="text-base font-semibold tracking-tight">
          No plot selected
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Search by coordinates to check whether the area has lost forest cover
          since the EUDR cutoff ({EUDR_CUTOFF_YEAR}).
        </p>
        {inputsSlot ? <div className="mt-4">{inputsSlot}</div> : null}
      </EmptyState>
    );
  }

  if (query.isPending) {
    return (
      <Frame plot={plot} inputsSlot={inputsSlot}>
        <Skeleton />
      </Frame>
    );
  }

  if (query.isError) {
    return (
      <Frame plot={plot} inputsSlot={inputsSlot}>
        <ErrorBlock
          message={query.error.message}
          onRetry={() => query.refetch()}
        />
      </Frame>
    );
  }

  const { plotAreaHa, lossHa, lossSinceCutoffHa } = query.data;
  const headlineLossHa = lossSinceCutoffHa;
  const compliant = headlineLossHa < COMPLIANCE_THRESHOLD_HA;

  return (
    <Frame plot={plot} inputsSlot={inputsSlot}>
      <div
        className={`rounded-xl border p-4 ${
          compliant
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
            : "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          {compliant ? (
            <>
              <span aria-hidden>✅</span>
              <span className="text-emerald-900 dark:text-emerald-200">
                Likely EUDR-compliant
              </span>
            </>
          ) : (
            <>
              <span aria-hidden>⚠️</span>
              <span className="text-amber-900 dark:text-amber-200">
                Deforestation detected
              </span>
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          {compliant
            ? `Less than ${formatHa(COMPLIANCE_THRESHOLD_HA)} of tree-cover loss within the plot since ${EUDR_CUTOFF_YEAR}. Demo verdict only, verify with a full due-diligence workflow.`
            : `Tree-cover loss detected after the EUDR cutoff (${EUDR_CUTOFF_YEAR}). This area would need further investigation under EUDR.`}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <Stat label="Plot area" value={formatHa(plotAreaHa)} />
        <Stat
          label={`Loss since ${EUDR_CUTOFF_YEAR}`}
          value={formatHa(headlineLossHa)}
          accent={!compliant}
          sub={formatPct(headlineLossHa, plotAreaHa) + " of plot"}
        />
        <Stat
          label="All-time loss (2001–)"
          value={formatHa(lossHa)}
          sub={formatPct(lossHa, plotAreaHa) + " of plot"}
        />
        <Stat
          label="Years with loss"
          value={String(query.data.byYear.length)}
        />
      </dl>

      {query.data.byYear.length ? (
        <YearChart data={query.data.byYear} cutoffYear={EUDR_CUTOFF_YEAR} />
      ) : null}

      <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] leading-relaxed text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200">
        <strong className="font-semibold">Demo data.</strong> The deforestation
        values shown here are hardcoded for demonstration purposes and are the
        same for every plot, they are not real Global Forest Watch data.
      </div>
    </Frame>
  );
}

function Frame({
  plot,
  inputsSlot,
  children,
}: {
  plot: NonNullable<ReturnType<typeof useAppStore.getState>["plot"]>;
  inputsSlot?: React.ReactNode;
  children: React.ReactNode;
}) {
  const title = plot.label ?? "Search radius";

  const subtitle =
    plot.center && plot.radiusKm
      ? `${plot.radiusKm} km around ${plot.center[1].toFixed(4)}°, ${plot.center[0].toFixed(4)}°`
      : "Search radius";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>
        {inputsSlot}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-black/15 bg-black/[0.02] p-6 dark:border-white/15 dark:bg-white/[0.03]">
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-black/5 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <dt className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd
        className={`mt-1 font-mono text-lg tabular-nums ${
          accent
            ? "text-amber-700 dark:text-amber-300"
            : "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        {value}
      </dd>
      {sub ? (
        <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          {sub}
        </p>
      ) : null}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      <div className="h-16 animate-pulse rounded-xl bg-black/[0.06] dark:bg-white/[0.06]" />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg bg-black/[0.06] dark:bg-white/[0.06]"
          />
        ))}
      </div>
    </div>
  );
}

function ErrorBlock({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900/40 dark:bg-red-950/20">
      <p className="font-medium text-red-900 dark:text-red-200">
        Couldn&apos;t fetch deforestation data.
      </p>
      <p className="mt-1 text-xs text-red-800/80 dark:text-red-300/80">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex h-7 items-center rounded-full bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-500"
      >
        Try again
      </button>
    </div>
  );
}

function YearChart({
  data,
  cutoffYear,
}: {
  data: { year: number; ha: number }[];
  cutoffYear: number;
}) {
  const max = Math.max(...data.map((d) => d.ha), 0.0001);
  return (
    <div>
      <h3 className="mb-2 text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Loss by year (ha)
      </h3>
      <div className="rounded-lg border border-black/5 bg-white/60 p-2 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex h-20 gap-1">
          {data.map((d) => {
            const post = d.year >= cutoffYear;
            return (
              <div
                key={d.year}
                className="flex flex-1 flex-col justify-end"
                title={`${d.year}: ${d.ha.toFixed(2)} ha`}
              >
                <div
                  className={`w-full rounded-sm ${
                    post
                      ? "bg-amber-500"
                      : "bg-emerald-500/80 dark:bg-emerald-500/60"
                  }`}
                  style={{
                    height: `${Math.max((d.ha / max) * 100, 6)}%`,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex gap-1">
          {data.map((d) => (
            <div
              key={d.year}
              className="flex-1 text-center text-[9px] text-zinc-500 dark:text-zinc-500"
            >
              {String(d.year).slice(-2)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
