import "server-only";
import { plotAreaHa } from "@/lib/geometry";
import type { PlotGeometry } from "@/types";

export type DeforestationResult = {
  plotAreaHa: number;
  lossHa: number;
  lossSinceCutoffHa: number;
  cutoffYear: number | null;
  byYear: { year: number; ha: number }[];
};

// Hardcoded illustrative dataset, modeled on a tropical coffee plot
// (e.g. Minas Gerais), with loss spread across pre- and post-EUDR-cutoff
// years so the compliance-warning UI has something to show.
const HARDCODED_LOSS_BY_YEAR: { year: number; ha: number }[] = [
  { year: 2003, ha: 1.2 },
  { year: 2007, ha: 0.8 },
  { year: 2010, ha: 2.1 },
  { year: 2015, ha: 1.5 },
  { year: 2018, ha: 0.9 },
  { year: 2020, ha: 1.4 },
  { year: 2022, ha: 3.2 },
  { year: 2023, ha: 2.8 },
];

export async function queryDeforestation(
  geometry: PlotGeometry,
  sinceYear: number | undefined,
): Promise<DeforestationResult> {
  const byYear = HARDCODED_LOSS_BY_YEAR;
  const lossHa = byYear.reduce((sum, e) => sum + e.ha, 0);
  const lossSinceCutoffHa = sinceYear
    ? byYear
        .filter((e) => e.year >= sinceYear)
        .reduce((sum, e) => sum + e.ha, 0)
    : 0;

  return {
    plotAreaHa: plotAreaHa(geometry),
    lossHa,
    lossSinceCutoffHa,
    cutoffYear: sinceYear ?? null,
    byYear,
  };
}
