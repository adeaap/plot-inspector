import { describe, expect, it } from "vitest";
import {
  SEARCH_RADIUS_KM,
  circlePolygon,
  formatHa,
  formatPct,
  plotAreaHa,
} from "./geometry";

describe("circlePolygon", () => {
  it("returns a closed ring (first point === last point)", () => {
    const polygon = circlePolygon([0, 0], 1);
    const ring = polygon.coordinates[0];
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it("emits steps + 1 points (closing point is the duplicate of the first)", () => {
    const polygon = circlePolygon([0, 0], 1, 32);
    expect(polygon.coordinates[0]).toHaveLength(33);
  });

  it("defaults to 64 steps when steps is omitted", () => {
    const polygon = circlePolygon([0, 0], 1);
    expect(polygon.coordinates[0]).toHaveLength(65);
  });

  it("encodes a Polygon GeoJSON geometry", () => {
    const polygon = circlePolygon([10, 20], 1);
    expect(polygon.type).toBe("Polygon");
    expect(polygon.coordinates).toHaveLength(1);
  });
});

describe("plotAreaHa", () => {
  it("returns ~π·r² hectares for a 1 km circle at the equator", () => {
    // π × 1² km² = π km² ≈ 314.159 ha. Allow 1% tolerance for the
    // equirectangular approximation + 64-segment polygon.
    const polygon = circlePolygon([0, 0], SEARCH_RADIUS_KM);
    const ha = plotAreaHa(polygon);
    expect(ha).toBeGreaterThan(310);
    expect(ha).toBeLessThan(316);
  });

  it("scales quadratically with radius", () => {
    const small = plotAreaHa(circlePolygon([0, 0], 1));
    const large = plotAreaHa(circlePolygon([0, 0], 2));
    // 2× radius → 4× area. Allow 5% tolerance for approximation.
    expect(large / small).toBeGreaterThan(3.8);
    expect(large / small).toBeLessThan(4.2);
  });
});

describe("formatHa", () => {
  it("returns hyphen for non-finite values", () => {
    expect(formatHa(Number.NaN)).toBe("-");
    expect(formatHa(Number.POSITIVE_INFINITY)).toBe("-");
  });

  it("clamps tiny values to <0.01 ha", () => {
    expect(formatHa(0.005)).toBe("<0.01 ha");
    expect(formatHa(0.0001)).toBe("<0.01 ha");
  });

  it("uses 2 decimals under 100 ha", () => {
    expect(formatHa(0.5)).toBe("0.50 ha");
    expect(formatHa(99.99)).toBe("99.99 ha");
  });

  it("uses 1 decimal between 100 and 10,000 ha", () => {
    expect(formatHa(100)).toBe("100.0 ha");
    expect(formatHa(5000)).toBe("5000.0 ha");
  });

  it("uses thousands separators above 10,000 ha", () => {
    expect(formatHa(15000)).toBe("15,000 ha");
  });
});

describe("formatPct", () => {
  it("returns hyphen for zero or negative denominators", () => {
    expect(formatPct(10, 0)).toBe("-");
    expect(formatPct(10, -5)).toBe("-");
  });

  it("clamps tiny percentages to <0.01%", () => {
    expect(formatPct(0.00001, 1)).toBe("<0.01%");
  });

  it("uses 2 decimals for sub-1% values", () => {
    expect(formatPct(0.5, 100)).toBe("0.50%");
  });

  it("uses 1 decimal for >= 1% values", () => {
    expect(formatPct(50, 100)).toBe("50.0%");
  });
});
