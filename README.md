# Journey Viewer Card

Paginated GPS journey viewer for Home Assistant. Browse past drives, rides, runs, hikes — one journey at a time on a map, with stats and driving-score detail below.

**Source-agnostic.** Toyota, Strava, Garmin, Komoot, OwnTracks-replay, or any custom integration that exposes journey data in the [contract shape](#data-contract).

> **Status: v0.1.** Card + visual editor are feature-complete against the [data contract](#data-contract). The Vite dev harness mounts the card with synthetic in-memory trips so cloners can iterate without a running HA. Live HA usage requires a producer integration (e.g. a modified `ha_toyota`) exposing a sensor with `attributes.trips[]`.

## Why this card exists

Home Assistant has good integrations for vehicles (Toyota, Tesla, BMW), fitness (Strava, Garmin), and continuous tracking (OwnTracks). What it doesn't have is a **viewer** for the per-journey detail those integrations carry. Lock state, energy charts, parking pin — all available. "Show me my last drive on a map" — until now, no card.

`nathan-gs/ha-map-card` (the closest existing card) does continuous-history paths beautifully but isn't journey-paginated. This card fills that specific gap.

## Features

- **One journey per view, prev/next pagination** (or keyboard arrows).
- **Map with route polyline**, optionally coloured by EV vs ICE / overspeed / highway / drive-mode.
- **Start/end pins** + behaviour markers for hard-accel/brake events along the route.
- **Stats grid** below the map: distance, duration, max/avg speed, fuel, driving scores, EV ratio, etc. — fully configurable rows.
- **Multi-source aware**: configure `sources: []` with one entry per data source (e.g. one car + one Strava). Trips can be combined or per-source.
- **Theme-aware**: respects HA's dark/light/custom theme variables.
- **Performance-aware**: `shouldUpdate()` short-circuits on unrelated `hass` ticks; map doesn't rebuild on every poll.

## Data contract

Each source's `entity` should expose `attributes.trips[]`, where each item matches:

```json
{
  "id": "fc204ad5-6fac-400a-b5c0-f512bb35a0cb",
  "label": "Tuesday afternoon drive",
  "source": "toyota",
  "activity_type": "drive",
  "start_ts": "2026-04-26T07:06:45Z",
  "end_ts":   "2026-04-26T07:15:54Z",
  "start": { "lat": 0.10, "lon": 0.10 },
  "end":   { "lat": 0.18, "lon": 0.16 },
  "route": [
    { "lat": 0.10, "lon": 0.10, "isEv": true,  "overspeed": false },
    { "lat": 0.12, "lon": 0.11, "isEv": false, "overspeed": false }
  ],
  "stats": {
    "distance_m": 4943,
    "duration_s": 549,
    "max_speed_kmh": 67,
    "average_speed_kmh": 32.4,
    "fuel_consumption_ml": 275,
    "ev_distance_m": 2379,
    "ev_time_s": 291
  },
  "scores": { "acceleration": 90, "braking": 71, "global": 81 },
  "behaviours": [
    { "lat": 0.13, "lon": 0.12, "type": "A", "good": true, "severity": 205.84 }
  ]
}
```

Per-route-point flags are optional and drive the polyline colouring: `isEv`, `overspeed`, `highway`, `mode`. Behaviours are GPS-tagged events (hard accel/brake) that render as map markers.

## Configuration

```yaml
type: custom:journey-viewer-card
title: "RAV4 recent trips"

sources:
  - name: "RAV4"
    entity: sensor.rav4_recent_trips      # exposes attributes.trips[]
    color: "#e63946"                      # default polyline color (used when color_by: solid)
    icon: mdi:car

order: newest_first                       # newest_first | oldest_first
default_index: 0

# Optional click handlers — routed through HA's standard action machinery
# (more-info / toggle / call-service / navigate / url / none / fire-dom-event).
# Defaults: tap → more-info on the first source's entity, hold/double_tap → none.
tap_action:        { action: more-info }
hold_action:       { action: navigate, navigation_path: /lovelace/journeys }
double_tap_action: { action: none }

pagination:
  show_counter: true                      # "1 / 5"
  wrap: false                             # disable [<] / [>] at edges
  keyboard: true                          # ← / → arrows when card focused

label:
  template: "{relative_day} {start_time} ({distance} / {duration})"
  # tokens: {relative_day} {start_time} {end_time} {distance} {duration}

map:
  height: 280
  zoom_to_fit: true
  padding_pct: 10
  gestures: locked                        # locked | enabled
  tile_provider: openstreetmap            # openstreetmap | carto-positron | carto-dark-matter
  polyline:
    color_by: ev                          # solid | ev | overspeed | highway | mode
    weight: 4
    opacity: 0.9
    palette:
      ev: "#1d8cf8"
      ice: "#f6a800"
      overspeed: "#e63946"
  markers:
    start: { color: "#2a9d8f", icon: mdi:play }
    end:   { color: "#e63946", icon: mdi:flag-checkered }
    behaviours:
      enabled: true
      style:
        good: { color: "#2a9d8f", radius: 5 }
        bad:  { color: "#e63946", radius: 6 }
      tooltip: "{type} severity={severity}"

stats_grid:
  columns_default: 4
  columns_mobile: 2
  tile_bg_color: ~                 # any CSS color; default = theme's --jv-tile-bg
  tile_bg_alpha: 1.0               # 0.0–1.0; fades the tile background only

  # Each row is a stat tile. Beyond the basic key + label + format, a row
  # can opt into FOUR independent decorators: thresholds (color+icon),
  # color_target/color_mode, bar background, trend arrow.
  rows:
    # Plain tile
    - { key: stats.distance_m, label: Distance, format: km, decimals: 2 }

    # Score tile with threshold-coloured bar + trend arrow
    - key: scores.global
      label: Score
      format: "{v} / 100"
      icon: mdi:medal
      thresholds:                  # walked top-to-bottom; last match wins.
        - { value: 0,  color: var(--error-color) }     # value >= 0
        - { value: 50, color: var(--warning-color) }   # value >= 50 (overrides red)
        - { value: 80, color: var(--success-color), icon: mdi:medal-outline }
      color_target: value          # value | tile  (default: value)
      color_mode: solid            # solid | gradient (default: solid)
      bar:
        max: 100                   # number OR dot-path "stats.distance_m"
        color: auto                # auto = follow thresholds + color_mode
        track: rgba(0, 0, 0, 0.06) # unfilled portion
      trend:
        position: after_value      # after_value | before_value | replace_icon
        show_delta: true
        invert: false              # true if lower = better (e.g. fuel use)
        format: ~                  # optional override for delta numeric format

    # Ratio with bar (value = key / ratio_of, bar fills 0-1)
    - key: stats.ev_distance_m
      ratio_of: stats.distance_m   # value = ev_distance_m / distance_m
      label: EV ratio
      format: "{v:.0%}"
      bar:
        max: 1                     # ratio's natural domain
        color: var(--journey-viewer-polyline-ev)
    - { key: stats.distance_m,         label: "Distance",  format: "km",          decimals: 2 }
    - { key: stats.duration_s,         label: "Duration",  format: "duration" }
    - { key: stats.average_speed_kmh,  label: "Avg speed", format: "{v:.1f} km/h" }
    - { key: stats.fuel_consumption_ml,label: "Fuel",      format: "L",           decimals: 3 }
    - { key: scores.global,            label: "Score",     format: "{v} / 100",   icon: mdi:medal }
    - { key: stats.ev_distance_m, ratio_of: stats.distance_m, label: "EV ratio", format: "{v:.0%}" }

empty_state:
  title: "No recent journeys"
  body: "No journey data in the last 14 days."
  icon: mdi:car-off
```

## Theming

The card respects HA theme variables (`--primary-color`, `--secondary-background-color`, `--card-background-color`, etc.) for all standard UI chrome. On top of that, three layers of theming are exposed for the journey-specific bits (polylines, markers, radii):

### Customisation precedence

For each colour or radius:

1. **YAML config** under `map.polyline.palette.<key>` — highest. Per-card override.
2. **CSS custom property** in a HA theme or `card_mod` — global override.
3. **Hardcoded default** — sensible fallback for both light and dark themes.

### Available CSS custom properties

```css
/* Polyline colors (per color_by mode) */
--journey-viewer-polyline-ev          /* default #1d8cf8 (blue)  */
--journey-viewer-polyline-ice         /* default #f6a800 (orange) */
--journey-viewer-polyline-overspeed   /* default #e63946 (red)    */
--journey-viewer-polyline-highway     /* default #7b2cbf (purple) */
--journey-viewer-polyline-solid       /* default #e63946 (red)    */
```

### Theme YAML example

Drop this in your `themes.yaml` to globally re-skin the card:

```yaml
my_theme:
  # Card adopts these alongside its own variables
  primary-color: "#ff5722"
  card-background-color: "#fff8f0"
  # Card-specific overrides
  journey-viewer-polyline-ev: "#39d353"
  journey-viewer-polyline-ice: "#ff7f50"
```

### card_mod example

For a one-off override on a single instance of the card:

```yaml
type: custom:journey-viewer-card
# ... rest of config
card_mod:
  style: |
    :host {
      --journey-viewer-polyline-ev: hotpink;
      --journey-viewer-polyline-ice: limegreen;
    }
```

### Standard HA tokens used

The card already adopts these without configuration:

| Token | Used for |
|---|---|
| `--primary-color` | Pager buttons (border, hover fill), Leaflet attribution links |
| `--text-primary-color` | Pager hover text |
| `--primary-text-color` | Trip label, tile values |
| `--secondary-text-color` | Tile labels, attribution, counter |
| `--secondary-background-color` | Tile backgrounds, map placeholder |
| `--card-background-color` | Legend overlay, Leaflet zoom buttons |
| `--divider-color` | Subtle borders |
| `--disabled-text-color` | Disabled pager state |
| `--error-color` | Error banner |
| `--ha-card-border-radius` | Map + tile rounding (falls back to 12px) |

Switching themes (light/dark/custom) just works without further configuration.

## Multi-source mode

Configure several sources at once (e.g. car + cycling + hiking), and the card will browse trips across all of them:

```yaml
sources:
  - { name: "RAV4",    entity: sensor.rav4_recent_trips,        icon: mdi:car }
  - { name: "Cycling", entity: sensor.strava_recent_activities, icon: mdi:bike }
  - { name: "Hiking",  entity: sensor.komoot_recent_tours,      icon: mdi:hiking }
```

Each source needs a normaliser somewhere upstream (a custom integration, a template sensor, a Python script automation) that converts the source-native shape into the card's data contract above.

## Install

### Manual

1. Build the bundle: `npm install && npm run build`. Output at `dist/journey-viewer-card.js`.
2. Copy `dist/journey-viewer-card.js` into your HA `/config/www/community/journey-viewer-card/journey-viewer-card.js`.
3. Add a Lovelace resource: **Settings → Dashboards → ⋮ → Resources → Add**, URL `/local/community/journey-viewer-card/journey-viewer-card.js`, type `JavaScript Module`.
4. Hard-refresh your dashboard (Ctrl+Shift+R), then add a `custom:journey-viewer-card` to a view.

### HACS

Coming soon. Until then, manual install above.

## Development

Local hot-reload preview against your live HA — no Docker rebuild, no committed fixture data:

```sh
npm install
cp .env.example .env.local
# edit .env.local: set DEV_HA_URL and DEV_HA_TOKEN
npm run dev
# opens http://localhost:5173. Vite proxies /ha-api → your HA, injecting
# the token server-side so it never reaches the browser.
```

The dev harness reads `attributes.trips` from `sensor.rav4_recent_trips` (change in `dev/main.ts` if your sensor is named differently). If the env vars are missing, the proxy is disabled and you'll see the card's empty state — HMR still works for code changes.

Build:

```sh
npm run build
# output: dist/journey-viewer-card.js (single self-contained bundle)
```

### Visual config editor

The card ships a built-in GUI editor (`getConfigElement`). When you add the card via "+ Add card" or click edit on an existing instance, HA loads `<journey-viewer-card-editor>` automatically. It covers:

- All top-level fields (title, order, default index)
- Sources list builder (add/remove/reorder, name, entity, icon, colour)
- Pagination, label template, map (with polyline subsection), empty state
- Stats grid row builder with a stat-catalogue picker (Distance, Duration, Avg/Max speed, Fuel, Score, EV/Eco/Highway ratio, custom path) plus per-row threshold ladder, bar background, and trend arrow editors
- "Show YAML" fallback drops to a code editor for anything beyond the GUI

### Generating a Strava fixture (optional tool)

`scripts/strava-fixture.py` is a stdlib-only Python script that pulls your full Strava activity history (paginating past the typical "10 most recent" cap of `craibo/ha_strava`) and writes a JSON file matching the [data contract](#data-contract) above. Useful if you want to point a deployed card at your own Strava data via a `template`-style sensor.

```sh
./scripts/strava-fixture.py --since 2019-01-01 --detailed --out my-trips.json
```

First run prompts for Strava API client_id / client_secret (create at https://www.strava.com/settings/api with `localhost` as the callback domain), opens a browser for OAuth, then writes the fixture. Tokens cached under `~/.config/strava-fixture.json`. The card itself never sees Strava data unless you wire it via a sensor; the script writes a JSON file you choose what to do with.

### Localization

The card currently ships English-only strings. The architecture is ready for multi-language support without rewrites — when the first translation arrives, add `src/localize/languages/<lang>.json` files and a small `localize(key, hass)` helper that picks `hass.locale.language` (mushroom / apexcharts / button-card all use this exact pattern). HA's built-in `hass.localize(key)` returns the key unchanged for non-core keys, so it can't be used for card-specific strings.

### Type sources

The card depends on `custom-card-helpers` for `HomeAssistant`, `LovelaceCard`, `LovelaceCardEditor`, `LovelaceCardConfig`, and `ActionConfig`. The package is no longer actively maintained (last meaningful release ~2022) and its `HomeAssistant` interface drifts slightly from upstream HA. Some mature cards (mushroom, button-card) vendor a hand-trimmed subset instead. We use the package because we lean on its action / haptic / format utilities; if a future HA release breaks the interface, switching to a vendored `src/ha-types.ts` is the escape hatch.

The action-handler Lit directive (`src/action-handler-directive.ts`) IS vendored — `custom-card-helpers` doesn't ship one, and mushroom's implementation is the de-facto standard.

## Credits + related

- Inspired by [Strava](https://strava.com)'s activity feed UX (paginated, map-per-activity, stats below).
- Map rendering powered by [Leaflet](https://leafletjs.com) + [OpenStreetMap](https://openstreetmap.org).
- Coexists with [`nathan-gs/ha-map-card`](https://github.com/nathan-gs/ha-map-card) — they do continuous tracking, this does per-journey detail.
- Built with [Lit](https://lit.dev) + TypeScript.

## License

MIT — see [LICENSE](LICENSE).
