/** Stats-grid v2 decorator helpers: thresholds, gradient color, bar, trend. */

import type { Threshold, Trip } from "./types.js";
import { getByPath } from "./lookup.js";

/** Walk thresholds top-to-bottom; return the last entry whose `value` <=
 *  the supplied numeric value. Returns undefined when nothing matches
 *  (e.g. value falls below the lowest threshold). */
export function matchThreshold(
  value: number | null | undefined,
  thresholds: Threshold[] | undefined,
): Threshold | undefined {
  if (value == null || !thresholds?.length) return undefined;
  let matched: Threshold | undefined;
  for (const t of thresholds) {
    if (value >= t.value) matched = t;
  }
  return matched;
}

/** Compute the colour for a value in gradient mode. Finds the bracketing
 *  threshold pair and emits a CSS `color-mix()` expression that the browser
 *  resolves at paint time. Falls back to solid match if there's only one
 *  bracketing edge (value before the first or after the last threshold). */
export function gradientColor(
  value: number | null | undefined,
  thresholds: Threshold[] | undefined,
): string | undefined {
  if (value == null || !thresholds?.length) return undefined;
  // Find the lower (last threshold whose value <= value) and the upper
  // (first threshold whose value > value).
  let lower: Threshold | undefined;
  let upper: Threshold | undefined;
  for (const t of thresholds) {
    if (t.value <= value) lower = t;
    else if (!upper) upper = t;
  }
  // Below the lowest threshold or above the highest: solid colour from the
  // single bracketing edge.
  if (!lower) return thresholds[0]?.color;
  if (!upper) return lower.color;
  if (!lower.color || !upper.color) return lower.color ?? upper.color;
  // Linear position 0..1 between the bracketing values.
  const range = upper.value - lower.value;
  if (range <= 0) return lower.color;
  const t = (value - lower.value) / range;
  // CSS color-mix: 1-t weight on lower, t implied weight on upper.
  return `color-mix(in srgb, ${lower.color} ${(1 - t) * 100}%, ${upper.color})`;
}

/** Resolve a bar `max` value: either a literal number or a dot-path into the
 *  same trip (e.g. "stats.distance_m"). */
export function resolveMax(
  max: number | string | undefined,
  trip: Trip,
): number | undefined {
  if (max == null) return undefined;
  if (typeof max === "number") return max;
  const v = getByPath(trip, max);
  return typeof v === "number" ? v : undefined;
}

/** 0..100 percentage of the bar's fill, clamped. */
export function barPct(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

export interface TrendInfo {
  /** "up" / "down" / "flat" relative to the previous trip's value. */
  direction: "up" | "down" | "flat";
  /** Numeric delta (current - previous). */
  delta: number;
  /** "good" / "bad" / "neutral" with `invert` applied. */
  sentiment: "good" | "bad" | "neutral";
}

/** Compute trend vs the previous trip's same-key value. */
export function computeTrend(
  current: number | null | undefined,
  previous: number | null | undefined,
  invert: boolean,
): TrendInfo | undefined {
  if (current == null || previous == null) return undefined;
  const delta = current - previous;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const sentiment =
    direction === "flat"
      ? "neutral"
      : invert
        ? // Lower is better: down = good, up = bad
          direction === "down"
          ? "good"
          : "bad"
        : // Higher is better: up = good, down = bad
          direction === "up"
          ? "good"
          : "bad";
  return { direction, delta, sentiment };
}
