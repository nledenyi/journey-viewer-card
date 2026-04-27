import "../src/card.js";
import type { JourneyViewerCard } from "../src/card.js";
import type { CardConfig, Trip } from "../src/types.js";

// Local Vite harness. Production reads trips from
// `hass.states[entity].attributes.trips`; we just inline a stub `hass` object
// with synthetic trips so the card's data path is identical between dev and
// prod. No real GPS data lives in this repo.
const ENTITY = "sensor.demo_recent_trips";

/** Two synthetic trips around a fictional point. Coordinates are deliberately
 *  fake (~Null Island shifted slightly) so cloners can run `npm run dev`
 *  without any local fixture file or producer integration. */
const SYNTHETIC_TRIPS: Trip[] = [
  {
    id: "demo-1",
    label: "Demo trip — today",
    source: "demo",
    activity_type: "drive",
    start_ts: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    end_ts: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    start: { lat: 0.10, lon: 0.10 },
    end: { lat: 0.18, lon: 0.16 },
    route: [
      { lat: 0.10, lon: 0.10, isEv: true,  overspeed: false },
      { lat: 0.12, lon: 0.11, isEv: true,  overspeed: false },
      { lat: 0.14, lon: 0.13, isEv: false, overspeed: false },
      { lat: 0.16, lon: 0.15, isEv: false, overspeed: true  },
      { lat: 0.18, lon: 0.16, isEv: false, overspeed: false },
    ],
    stats: {
      distance_m: 12340,
      duration_s: 1820,
      average_speed_kmh: 24.4,
      fuel_consumption_ml: 580,
      ev_distance_m: 4920,
    },
    scores: { acceleration: 88, braking: 74, global: 81 },
    behaviours: [
      { lat: 0.13, lon: 0.12, type: "A", good: true,  severity: 180 },
      { lat: 0.16, lon: 0.15, type: "B", good: false, severity: 240 },
    ],
  },
  {
    id: "demo-2",
    label: "Demo trip — yesterday",
    source: "demo",
    activity_type: "drive",
    start_ts: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    end_ts: new Date(Date.now() - 25.5 * 3600 * 1000).toISOString(),
    start: { lat: 0.18, lon: 0.16 },
    end: { lat: 0.10, lon: 0.10 },
    route: [
      { lat: 0.18, lon: 0.16, isEv: true, overspeed: false },
      { lat: 0.16, lon: 0.14, isEv: true, overspeed: false },
      { lat: 0.13, lon: 0.12, isEv: true, overspeed: false },
      { lat: 0.10, lon: 0.10, isEv: true, overspeed: false },
    ],
    stats: {
      distance_m: 11210,
      duration_s: 1750,
      average_speed_kmh: 23.1,
      fuel_consumption_ml: 0,
      ev_distance_m: 11210,
    },
    scores: { acceleration: 92, braking: 81, global: 87 },
  },
];

const config: CardConfig = {
  type: "custom:journey-viewer-card",
  title: "Demo recent trips",
  sources: [{ name: "Demo", entity: ENTITY, color: "#e63946", icon: "mdi:car" }],
  order: "newest_first",
  default_index: 0,
  pagination: { show_counter: true, wrap: false, keyboard: true },
  label: { template: "{relative_day} {start_time} ({distance} / {duration})" },
  map: {
    height: 280,
    zoom_to_fit: true,
    padding_pct: 10,
    gestures: "locked",
    tile_provider: "openstreetmap",
    polyline: {
      color_by: "ev",
      weight: 4,
      opacity: 0.9,
      palette: { ev: "#1d8cf8", ice: "#f6a800", overspeed: "#e63946" },
    },
    markers: {
      start: { color: "#2a9d8f", icon: "mdi:play" },
      end: { color: "#e63946", icon: "mdi:flag-checkered" },
      behaviours: {
        enabled: true,
        style: { good: { color: "#2a9d8f", radius: 5 }, bad: { color: "#e63946", radius: 6 } },
        tooltip: "{type} severity={severity}",
      },
    },
  },
  stats_grid: {
    columns_default: 4,
    columns_mobile: 2,
    rows: [
      { key: "stats.distance_m", label: "Distance", format: "km", decimals: 2 },
      { key: "stats.duration_s", label: "Duration", format: "duration" },
      { key: "stats.average_speed_kmh", label: "Avg speed", format: "{v:.1f} km/h" },
      { key: "stats.fuel_consumption_ml", label: "Fuel", format: "L", decimals: 3 },
      { key: "scores.global", label: "Score", format: "{v} / 100", icon: "mdi:medal" },
      { key: "scores.acceleration", label: "Accel", format: "{v} / 100" },
      { key: "scores.braking", label: "Braking", format: "{v} / 100" },
      { key: "stats.ev_distance_m", ratio_of: "stats.distance_m", label: "EV ratio", format: "{v:.0%}" },
    ],
  },
  empty_state: {
    title: "No recent trips",
    body: "No trips in the last 14 days.",
    icon: "mdi:car-off",
  },
};

const card = document.getElementById("card") as JourneyViewerCard;
card.setConfig(config);
// Minimal hass shim: only the bits the card touches.
card.hass = {
  states: {
    [ENTITY]: { attributes: { trips: SYNTHETIC_TRIPS } },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;
