import type { StyleSpecification } from "maplibre-gl";

/**
 * Hansen Global Forest Change "year of loss" tiles, served by GFW.
 * Pixels are red where tree cover was lost; transparent elsewhere.
 */
export const HANSEN_LOSS_TILES =
  "https://tiles.globalforestwatch.org/umd_tree_cover_loss/v1.11/tcd_30/{z}/{x}/{y}.png";

export const HANSEN_ATTRIBUTION =
  '<a href="https://glad.umd.edu/dataset/global-2010-tree-cover-30-m" target="_blank" rel="noopener noreferrer">Hansen / GFW</a>';

const ESRI_REFERENCE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

/**
 * Curated ESRI Wayback release IDs spanning 2018–2026.
 * Wayback archives the World Imagery basemap on every update; each release
 * reflects whatever scenes were live in that month. We use them to give the
 * UI a "before / after" feel for EUDR (cutoff: 2020-12-31).
 *
 * Discover more via:
 *   curl -s https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json
 */
export type ImageryRelease = {
  id: string;
  date: string;
  label: string;
  hint?: string;
};

export const IMAGERY_RELEASES: ImageryRelease[] = [
  {
    id: "1049",
    date: "2021-01-13",
    label: "Jan 2021",
    hint: "EUDR baseline",
  },
  {
    id: "64001",
    date: "2026-02-26",
    label: "Feb 2026",
    hint: "Latest",
  },
];

export const DEFAULT_IMAGERY_RELEASE =
  IMAGERY_RELEASES[IMAGERY_RELEASES.length - 1];

export function imageryTileUrl(releaseId: string): string {
  return `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/${releaseId}/{z}/{y}/{x}`;
}

/**
 * Build the MapLibre style for a given Wayback release. The reference layer
 * (country names, major boundaries) is current, it doesn't change between
 * historical imagery releases.
 */
export function buildBasemapStyle(releaseId: string): StyleSpecification {
  return {
    version: 8,
    sources: {
      "esri-imagery": {
        type: "raster",
        tiles: [imageryTileUrl(releaseId)],
        tileSize: 256,
        maxzoom: 19,
        attribution:
          'Imagery © <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> Wayback, USGS, NOAA',
      },
      "esri-reference": {
        type: "raster",
        tiles: [ESRI_REFERENCE],
        tileSize: 256,
        maxzoom: 13,
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#0b1726" },
      },
      {
        id: "imagery",
        type: "raster",
        source: "esri-imagery",
        paint: { "raster-resampling": "linear" },
      },
      {
        id: "reference",
        type: "raster",
        source: "esri-reference",
        paint: { "raster-opacity": 0.85 },
      },
    ],
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  };
}

export const DEFAULT_VIEW = {
  center: [-55.0, -9.5] as [number, number],
  zoom: 4,
};
