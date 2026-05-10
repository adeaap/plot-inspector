"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  buildBasemapStyle,
  DEFAULT_VIEW,
  ESRI_ATTRIBUTION,
  HANSEN_ATTRIBUTION,
  HANSEN_LOSS_TILES,
  imageryTileUrl,
} from "@/lib/tiles";
import { geometryBBox } from "@/lib/geometry";
import { useAppStore } from "@/store/useAppStore";

const HANSEN_SOURCE_ID = "hansen-loss";
const HANSEN_LAYER_ID = "hansen-loss-layer";

export function Map() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const showLossLayer = useAppStore((s) => s.showLossLayer);
  const imageryReleaseId = useAppStore((s) => s.imageryReleaseId);
  const plot = useAppStore((s) => s.plot);
  const flyToTarget = useAppStore((s) => s.flyToTarget);

  // Map initialization (run once).
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Use the latest store value so the right release loads on first paint,
    // even after HMR or fast nav (where state may persist from a prior
    // mount).
    const initialReleaseId = useAppStore.getState().imageryReleaseId;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildBasemapStyle(initialReleaseId),
      center: DEFAULT_VIEW.center,
      zoom: DEFAULT_VIEW.zoom,
      attributionControl: {
        compact: false,
        customAttribution: [ESRI_ATTRIBUTION, HANSEN_ATTRIBUTION],
      },
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({}), "top-right");

    map.on("load", () => {
      // Hansen tree-cover-loss raster overlay.
      if (!map.getSource(HANSEN_SOURCE_ID)) {
        map.addSource(HANSEN_SOURCE_ID, {
          type: "raster",
          tiles: [HANSEN_LOSS_TILES],
          tileSize: 256,
          attribution: HANSEN_ATTRIBUTION,
        });
        map.addLayer({
          id: HANSEN_LAYER_ID,
          type: "raster",
          source: HANSEN_SOURCE_ID,
          paint: { "raster-opacity": 0.75 },
        });
      }

      // GeoJSON source for the analyzed plot polygon outline. Dashed style
      // signals the 1 km circle is an approximation of a search radius, not a
      // surveyed boundary.
      map.addSource("plot", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "plot-fill",
        type: "fill",
        source: "plot",
        paint: {
          "fill-color": "#22c55e",
          "fill-opacity": 0.15,
        },
      });
      map.addLayer({
        id: "plot-outline",
        type: "line",
        source: "plot",
        paint: {
          "line-color": "#16a34a",
          "line-width": 2,
          "line-dasharray": [4, 2],
        },
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync the analyzed-plot GeoJSON layer with the store and fly to it.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      const src = map.getSource("plot") as maplibregl.GeoJSONSource | undefined;
      if (!src) return;
      src.setData(
        plot
          ? {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {},
                  geometry: plot.geometry,
                },
              ],
            }
          : { type: "FeatureCollection", features: [] },
      );
      if (plot) {
        // For coordinate searches we know the center, so fly there directly
        // at a fixed zoom, fitBounds caps out around zoom ~15.8 for a 1 km
        // bbox in this viewport, which isn't tight enough to see individual
        // tree-cover features. flyTo with an explicit zoom forces the closer
        // view we want.
        if (plot.center) {
          map.flyTo({
            center: plot.center,
            zoom: 15,
            duration: 1200,
            essential: true,
          });
        } else {
          const [minX, minY, maxX, maxY] = geometryBBox(plot.geometry);
          map.fitBounds(
            [
              [minX, minY],
              [maxX, maxY],
            ],
            { padding: 48, duration: 800, maxZoom: 17 },
          );
        }
      }
    };

    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [plot]);

  // Prewarm fly: move the camera (without setting a plot) so tiles for the
  // upcoming location start loading. Used by the tour to mask tile-fetch
  // latency before the user clicks through to a real plot.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToTarget) return;
    const apply = () => {
      map.flyTo({
        center: flyToTarget.center,
        zoom: flyToTarget.zoom,
        duration: 1200,
        essential: true,
      });
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [flyToTarget]);

  // Toggle the Hansen layer visibility.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      if (!map.getLayer(HANSEN_LAYER_ID)) return;
      map.setLayoutProperty(
        HANSEN_LAYER_ID,
        "visibility",
        showLossLayer ? "visible" : "none",
      );
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [showLossLayer]);

  // Swap the ESRI Wayback imagery when the user picks a different date.
  // setTiles() didn't reliably invalidate the cache, so we remove + re-add
  // the layer/source. The reference layer above and Hansen overlay are
  // untouched.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      if (map.getLayer("imagery")) map.removeLayer("imagery");
      if (map.getSource("esri-imagery")) map.removeSource("esri-imagery");
      map.addSource("esri-imagery", {
        type: "raster",
        tiles: [imageryTileUrl(imageryReleaseId)],
        tileSize: 256,
        maxzoom: 19,
      });
      // Insert directly above the background, below reference + Hansen.
      map.addLayer(
        {
          id: "imagery",
          type: "raster",
          source: "esri-imagery",
          paint: { "raster-resampling": "linear" },
        },
        "reference",
      );
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [imageryReleaseId]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Map showing plot location and forest-loss overlay"
      className="h-full w-full"
    />
  );
}
