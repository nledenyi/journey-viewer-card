/** Pulling trips from a hass object's source entities, plus shape helpers. */

import type { SourceConfig, Trip } from "./types.js";

/** Take a fixture or hass-attribute payload and extract the trips array. */
export function collectTrips(payload: unknown): Trip[] {
  if (Array.isArray(payload)) return payload as Trip[];
  if (payload && typeof payload === "object" && "trips" in payload) {
    const t = (payload as { trips: unknown }).trips;
    if (Array.isArray(t)) return t as Trip[];
  }
  return [];
}

/** Read trips from each configured source's HA entity attributes. */
export function normalizeFromHass(
  hass: { states?: Record<string, { attributes?: Record<string, unknown> }> } | undefined,
  sources: SourceConfig[],
): Trip[] {
  if (!hass?.states) return [];
  const out: Trip[] = [];
  for (const src of sources) {
    if (!src.entity) continue;
    const ent = hass.states[src.entity];
    if (!ent?.attributes) continue;
    const trips = collectTrips(ent.attributes.trips);
    for (const t of trips)
      out.push({ ...t, source: t.source ?? src.name, source_entity: src.entity });
  }
  return out;
}

export function sortTrips(
  trips: Trip[],
  order: "newest_first" | "oldest_first",
): Trip[] {
  const cp = trips.slice();
  cp.sort((a, b) => {
    const at = a.start_ts ? Date.parse(a.start_ts) : 0;
    const bt = b.start_ts ? Date.parse(b.start_ts) : 0;
    return order === "newest_first" ? bt - at : at - bt;
  });
  return cp;
}
