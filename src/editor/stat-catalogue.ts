/** Stat catalogue: human-friendly named metrics that the row picker offers.
 *
 *  Each entry maps to a `key` (and optionally a `ratio_of`) on a Trip. The
 *  picker hides the YAML-key/ratio-of split from the user — they pick "EV
 *  ratio" by name and the editor stamps both fields.
 *
 *  __custom__ is the escape hatch: text fields for raw dot-paths.
 */

export interface StatCatalogueEntry {
  /** Picker option id. */
  id: string;
  /** Human label shown in the dropdown. */
  label: string;
  /** Helper text under the dropdown — usually what the metric represents. */
  description?: string;
  /** Dot-path into the Trip object. Empty for __custom__. */
  key: string;
  /** Optional dot-path denominator. Presence makes this a ratio. */
  ratio_of?: string;
  /** Default `format` string when stamped onto a fresh row. */
  defaultFormat?: string;
  /** Default `icon` when stamped onto a fresh row. */
  defaultIcon?: string;
  /** Default `decimals` when stamped onto a fresh row. */
  defaultDecimals?: number;
}

export const STAT_CATALOGUE: StatCatalogueEntry[] = [
  // Distance / time
  {
    id: "distance",
    label: "Distance",
    description: "Total distance travelled",
    key: "stats.distance_m",
    defaultFormat: "km",
    defaultIcon: "mdi:map-marker-distance",
    defaultDecimals: 2,
  },
  {
    id: "duration",
    label: "Duration",
    description: "Trip duration",
    key: "stats.duration_s",
    defaultFormat: "duration",
    defaultIcon: "mdi:timer-outline",
  },
  // Speed
  {
    id: "avg_speed",
    label: "Avg speed",
    description: "Average speed across the trip",
    key: "stats.average_speed_kmh",
    defaultFormat: "{v:.1f} km/h",
    defaultIcon: "mdi:speedometer-medium",
  },
  {
    id: "max_speed",
    label: "Max speed",
    description: "Peak speed during the trip",
    key: "stats.max_speed_kmh",
    defaultFormat: "{v} km/h",
    defaultIcon: "mdi:speedometer",
  },
  // Fuel
  {
    id: "fuel",
    label: "Fuel",
    description: "Fuel consumed (litres)",
    key: "stats.fuel_consumption_ml",
    defaultFormat: "L",
    defaultIcon: "mdi:gas-station",
    defaultDecimals: 3,
  },
  // Scores
  {
    id: "score_global",
    label: "Score (global)",
    key: "scores.global",
    defaultFormat: "{v} / 100",
    defaultIcon: "mdi:medal",
  },
  {
    id: "score_accel",
    label: "Score (acceleration)",
    key: "scores.acceleration",
    defaultFormat: "{v} / 100",
  },
  {
    id: "score_brake",
    label: "Score (braking)",
    key: "scores.braking",
    defaultFormat: "{v} / 100",
  },
  // Sport / fitness (producers supply these; see the README data contract's
  // optional sport-stat keys)
  {
    id: "pace",
    label: "Pace",
    description: "Seconds per km, shown as m:ss /km",
    key: "stats.pace_s_per_km",
    defaultFormat: "pace",
    defaultIcon: "mdi:run-fast",
  },
  {
    id: "elevation_gain",
    label: "Elevation gain",
    description: "Total ascent",
    key: "stats.elevation_gain_m",
    defaultFormat: "{v:.0f} m",
    defaultIcon: "mdi:trending-up",
  },
  {
    id: "avg_heartrate",
    label: "Avg heart rate",
    key: "stats.average_heartrate_bpm",
    defaultFormat: "{v:.0f} bpm",
    defaultIcon: "mdi:heart-pulse",
  },
  {
    id: "calories",
    label: "Calories",
    key: "stats.calories_kcal",
    defaultFormat: "{v:.0f} kcal",
    defaultIcon: "mdi:fire",
  },
  // Ratios (used to be `computed`)
  {
    id: "ev_ratio",
    label: "EV ratio",
    description: "EV km ÷ total km",
    key: "stats.ev_distance_m",
    ratio_of: "stats.distance_m",
    defaultFormat: "{v:.0%}",
    defaultIcon: "mdi:lightning-bolt",
  },
  {
    id: "eco_ratio",
    label: "Eco ratio",
    description: "Eco km ÷ total km",
    key: "stats.eco_distance_m",
    ratio_of: "stats.distance_m",
    defaultFormat: "{v:.0%}",
    defaultIcon: "mdi:leaf",
  },
  {
    id: "highway_ratio",
    label: "Highway ratio",
    description: "Highway km ÷ total km",
    key: "stats.length_highway_m",
    ratio_of: "stats.distance_m",
    defaultFormat: "{v:.0%}",
    defaultIcon: "mdi:highway",
  },
  // Escape hatch
  {
    id: "__custom__",
    label: "Custom path…",
    description: "Specify any dot-path manually",
    key: "",
  },
];

/** Match a stored row back to a catalogue entry by (key, ratio_of). */
export function findCatalogueEntry(
  key: string | undefined,
  ratio_of: string | undefined,
): StatCatalogueEntry {
  if (key) {
    const match = STAT_CATALOGUE.find(
      (e) => e.key === key && (e.ratio_of ?? "") === (ratio_of ?? ""),
    );
    if (match) return match;
  }
  return STAT_CATALOGUE[STAT_CATALOGUE.length - 1]; // __custom__
}
