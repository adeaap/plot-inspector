import area from "@turf/area";
import bbox from "@turf/bbox";
import type { Feature, Polygon } from "geojson";
import type { PlotGeometry } from "@/types";

// Default radius for a coordinate-search plot. Lives next to circlePolygon
// because that's the only function that consumes it semantically.
export const SEARCH_RADIUS_KM = 1;

export function plotAreaHa(geometry: PlotGeometry): number {
  const feature: Feature<PlotGeometry> = {
    type: "Feature",
    properties: {},
    geometry,
  };
  return area(feature) / 10_000;
}

export function geometryBBox(
  geometry: PlotGeometry,
): [number, number, number, number] {
  const feature: Feature<PlotGeometry> = {
    type: "Feature",
    properties: {},
    geometry,
  };
  const [minX, minY, maxX, maxY] = bbox(feature);
  return [minX, minY, maxX, maxY];
}

// Equirectangular circle approximation around [lng, lat]. Accurate enough
// for small radii (≤ a few km) at any latitude; for the demo's 1 km radius
// the distortion is well under 1 m even near the poles.
export function circlePolygon(
  center: [number, number],
  radiusKm: number,
  steps: number = 64,
): Polygon {
  const [lng, lat] = center;
  const latRad = (lat * Math.PI) / 180;
  const dLat = radiusKm / 111.32;
  const dLng = radiusKm / (111.32 * Math.cos(latRad));

  const ring: [number, number][] = [];
  for (let i = 0; i < steps; i += 1) {
    const angle = (i / steps) * 2 * Math.PI;
    ring.push([lng + dLng * Math.cos(angle), lat + dLat * Math.sin(angle)]);
  }
  ring.push(ring[0]);

  return { type: "Polygon", coordinates: [ring] };
}

export function formatHa(ha: number): string {
  if (!Number.isFinite(ha)) return "-";
  if (ha < 0.01) return "<0.01 ha";
  if (ha < 100) return `${ha.toFixed(2)} ha`;
  if (ha < 10_000) return `${ha.toFixed(1)} ha`;
  return `${Math.round(ha).toLocaleString()} ha`;
}

export function formatPct(numerator: number, denominator: number): string {
  if (!denominator || denominator <= 0) return "-";
  const pct = (numerator / denominator) * 100;
  if (pct < 0.01) return "<0.01%";
  if (pct < 1) return `${pct.toFixed(2)}%`;
  return `${pct.toFixed(1)}%`;
}
