import type { MultiPolygon, Polygon } from "geojson";

export type PlotGeometry = Polygon | MultiPolygon;

export type Plot = {
  id: string;
  geometry: PlotGeometry;
  label?: string;
  center?: [number, number];
  radiusKm?: number;
};
