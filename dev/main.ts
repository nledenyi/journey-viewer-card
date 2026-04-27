import "../src/card.js";
import type { JourneyViewerCard } from "../src/card.js";
import type { CardConfig, Trip } from "../src/types.js";

// Local Vite harness. Production reads trips from
// `hass.states[entity].attributes.trips`; in dev we fetch the same data from
// the running HA via Vite's `/ha-api` proxy (token is injected server-side
// in vite.config.ts so it never touches the browser).
//
// Set up:
//   1. Copy .env.example → .env.local
//   2. Edit DEV_HA_URL and DEV_HA_TOKEN
//   3. npm run dev
//
// If the env vars are missing the proxy is disabled and you'll see the empty
// state — the card itself still mounts and re-renders on save (HMR works).
const ENTITY = "sensor.rav4_recent_trips";

const config: CardConfig = {
  type: "custom:journey-viewer-card",
  title: "Live HA dev",
  sources: [{ name: "Vehicle", entity: ENTITY, color: "#e63946", icon: "mdi:car" }],
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
    title: "No trips loaded",
    body: "Set DEV_HA_URL + DEV_HA_TOKEN in .env.local then restart `npm run dev`.",
    icon: "mdi:car-off",
  },
};

async function loadTripsFromHa(entity: string): Promise<Trip[]> {
  try {
    const r = await fetch(`/ha-api/states/${encodeURIComponent(entity)}`);
    if (!r.ok) {
      console.warn(`[dev] HA proxy ${r.status} ${r.statusText}; rendering empty state`);
      return [];
    }
    const state = (await r.json()) as { attributes?: { trips?: Trip[] } };
    return state.attributes?.trips ?? [];
  } catch (err) {
    console.warn("[dev] HA proxy unreachable; rendering empty state", err);
    return [];
  }
}

(async () => {
  const trips = await loadTripsFromHa(ENTITY);

  const card = document.getElementById("card") as JourneyViewerCard;
  card.setConfig(config);
  // Minimal hass shim: only the bits the card touches.
  card.hass = {
    states: {
      [ENTITY]: { attributes: { trips } },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
})();
