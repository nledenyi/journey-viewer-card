/**
 * Types for the journey-viewer card.
 *
 * The Trip shape is data-source-agnostic. Toyota, Strava, Garmin etc. each
 * have a normaliser that converts their native data into this shape. The
 * card never sees source-specific shapes.
 */

import type { ActionConfig } from "custom-card-helpers";

export interface Coord {
  lat: number;
  lon: number;
}

export interface RoutePoint extends Coord {
  /** True if the segment leading into this point was driven on EV power. */
  isEv?: boolean;
  /** True if the segment was over the speed limit. */
  overspeed?: boolean;
  /** True if the segment was on a highway / motorway. */
  highway?: boolean;
  /** Vehicle-specific drive mode (PHEV: 0=eco, 1=power, etc). */
  mode?: number;
  /** ISO timestamp of this waypoint, if available. */
  ts?: string;
  /** Speed at this point in km/h, if available. */
  speed?: number;
  /** Elevation in metres, if available. */
  elevation?: number;
}

export interface Behaviour extends Coord {
  /** Event timestamp. */
  ts?: string;
  /** Type code; Toyota uses single letters: A=accel, B=brake (verify). */
  type?: string;
  /** True = positive event (smooth driving), false = negative (jerky). */
  good?: boolean;
  /** Higher = stronger event. Units source-specific. */
  severity?: number;
  /** Localised coaching message id (Toyota). */
  coachingMsg?: number;
  /** Localised diagnostic message id (Toyota). */
  diagnosticMsg?: number;
  /** Free-form per-event context. */
  context?: Record<string, unknown>;
  priority?: boolean;
}

export interface TripStats {
  /** Distance in metres. */
  distance_m?: number | null;
  /** Duration in seconds. */
  duration_s?: number | null;
  /** Time spent stationary mid-trip in seconds. */
  duration_idle_s?: number | null;
  /** Peak speed during the trip in km/h. NOTE: Toyota EU does not populate this per-trip. */
  max_speed_kmh?: number | null;
  /** Average speed in km/h. */
  average_speed_kmh?: number | null;
  /** Fuel consumption in millilitres. */
  fuel_consumption_ml?: number | null;
  /** Distance / duration over the speed limit. */
  length_overspeed_m?: number | null;
  duration_overspeed_s?: number | null;
  /** Distance / duration on highway. */
  length_highway_m?: number | null;
  duration_highway_s?: number | null;
  countries?: string[] | null;
  night_trip?: boolean | null;
  /** Hybrid-driving breakdown (PHEV). */
  ev_time_s?: number | null;
  ev_distance_m?: number | null;
  charge_time_s?: number | null;
  charge_distance_m?: number | null;
  eco_time_s?: number | null;
  eco_distance_m?: number | null;
  power_time_s?: number | null;
  power_distance_m?: number | null;
}

export interface TripScores {
  acceleration?: number;
  braking?: number;
  global?: number;
  advice?: number;
}

export interface Trip {
  id: string;
  label?: string;
  source: string;
  activity_type?: "drive" | "ride" | "run" | "hike" | "ski" | "other";
  start_ts?: string;
  end_ts?: string;
  start: Coord;
  end: Coord;
  route: RoutePoint[];
  stats: TripStats;
  scores?: TripScores | null;
  behaviours?: Behaviour[] | null;
}

// ─── Card config schema ─────────────────────────────────────────────────────

export type ColorBy = "solid" | "ev" | "overspeed" | "highway" | "mode";

export interface SourceConfig {
  name: string;
  /** HA entity whose attributes.trips[] is rendered. Optional in dev mode. */
  entity?: string;
  /** Default polyline color for this source if color_by=solid. */
  color?: string;
  icon?: string;
}

export interface MapConfig {
  height?: number;
  zoom_to_fit?: boolean;
  padding_pct?: number;
  gestures?: "locked" | "enabled";
  tile_provider?: "openstreetmap" | "carto-positron" | "carto-dark-matter";
  polyline?: {
    color_by?: ColorBy;
    weight?: number;
    opacity?: number;
    palette?: Record<string, string>;
  };
  markers?: {
    start?: { color?: string; icon?: string };
    end?: { color?: string; icon?: string };
    behaviours?: {
      enabled?: boolean;
      style?: {
        good?: { color?: string; radius?: number };
        bad?: { color?: string; radius?: number };
      };
      tooltip?: string;
    };
  };
}

/** A threshold entry. Walked top-to-bottom, last match wins.
 *  An entry "matches" when the row's numeric value >= entry.value. */
export interface Threshold {
  value: number;
  /** Matched color (CSS string). Used by color_target and bar.color: auto. */
  color?: string;
  /** Matched icon (mdi:...). Overrides the row's static `icon` when matched. */
  icon?: string;
}

export interface BarConfig {
  /** Bar full-fill upper bound. Number, or dot-path string into the same trip
   *  (e.g. "stats.distance_m" makes the bar fill = current_value/distance_m). */
  max?: number | string;
  /** "auto" follows `thresholds` + `color_mode`; any other CSS color is used literally. */
  color?: string;
  /** Color of the unfilled portion. Defaults to a near-transparent neutral. */
  track?: string;
}

export interface TrendConfig {
  /** Where to render the arrow + delta. */
  position?: "after_value" | "before_value" | "replace_icon";
  /** Show the numeric delta ("+1.7") next to the arrow. False = arrow only. */
  show_delta?: boolean;
  /** True for metrics where lower is better (e.g. fuel use, commute time).
   *  Inverts up-is-good vs down-is-good colour mapping. */
  invert?: boolean;
  /** Format string for the delta. Independent from the row's `format` since
   *  the row's format often includes a max-suffix ("/ 100") or unit that
   *  doesn't make sense on a delta. Defaults to plain numeric with
   *  row.decimals precision. Same template tokens as `format`: "{v}",
   *  "{v:.1f}", "{v:.0%}", or "duration"/"km"/"L" presets. */
  format?: string;
}

export interface StatsRow {
  /** Dot-path lookup into the Trip object: "stats.distance_m" or "scores.global". */
  key?: string;
  /** Optional dot-path. When set, the displayed value becomes `key / ratio_of`,
   *  e.g. `key: stats.ev_distance_m, ratio_of: stats.distance_m` → EV share.
   *  Source-agnostic: any two numeric paths can be composed. */
  ratio_of?: string;
  label: string;
  /** "km" | "L" | "duration" | "{v:fmt}" template. */
  format?: string;
  decimals?: number;
  /** Static fallback icon. Overridden by a matched threshold's `icon`. */
  icon?: string;

  /** Threshold ladder. Each entry's `value` is a lower bound (inclusive).
   *  Walked top-to-bottom; last match wins. Drives color and icon decoration. */
  thresholds?: Threshold[];
  /** What to colour from a matched threshold. Default: value (text only). */
  color_target?: "value" | "tile";
  /** Solid = use the matched threshold colour as-is.
   *  Gradient = interpolate between adjacent thresholds based on actual value. */
  color_mode?: "solid" | "gradient";
  /** Bar background (combines freely with thresholds). */
  bar?: BarConfig;
  /** Trend arrow vs the previous trip in the loaded list. */
  trend?: TrendConfig;
}

export interface PaginationConfig {
  show_counter?: boolean;
  wrap?: boolean;
  keyboard?: boolean;
}

export interface CardConfig {
  type: string;
  title?: string;
  sources: SourceConfig[];
  order?: "newest_first" | "oldest_first";
  default_index?: number;
  pagination?: PaginationConfig;
  label?: { template?: string };
  map?: MapConfig;
  /** Action dispatched on a tap anywhere in the card body (excluding pager
   *  buttons, which keep their own click handlers). Routed through HA's
   *  standard action handler — supports more-info / toggle / call-service /
   *  navigate / url / none / fire-dom-event. */
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  stats_grid?: {
    columns_default?: number;
    columns_mobile?: number;
    rows: StatsRow[];
    /** Tile background color. Any CSS color value (#hex, rgb(), rgba(), named,
     *  or var(--...)). Default: theme's `--jv-tile-bg` (which itself defaults
     *  to `--secondary-background-color`). */
    tile_bg_color?: string;
    /** Alpha applied to the tile background only (text stays full opacity).
     *  0.0 = fully transparent bg; 1.0 (default) = fully opaque. */
    tile_bg_alpha?: number;
  };
  empty_state?: { title?: string; body?: string; icon?: string };
}
