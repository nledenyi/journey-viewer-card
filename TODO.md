# Roadmap / deferred items

Features and polish explicitly deferred from v0.1. Roughly ordered by likelihood.

## Foundation polish

- [ ] **Localisation layer** (`src/localize/languages/en.json` + `localize()` helper). Hardcoded English strings: pagination tooltips, empty-state text, stats-row default labels, editor field labels (`src/editor/schema.ts:LABELS`). Deferred until there's a second language to ship.
- [ ] **ESLint + Prettier** rig (boilerplate-card uses both).
- [ ] **Trend format inheritance for `{v:.N%}` / `{v:.Nf}` templates**. Currently inherits row.format only for unit-converter presets (`km`, `L`, `duration`); pure-numeric templates fall through to smart defaults. Could be cleaner: detect templates with no max-suffix and inherit those too.
- [ ] **Tests**. None right now. Worth adding for the format helpers and the Strava normaliser (`scripts/strava-fixture.py:to_trip`) since that's where source-specific bugs will live.

## Bubble Card visual harmony

### Tier 1 - Bubble Card-style pills natively

Restyle the stats grid tiles to look like Bubble Card sub-buttons: rounded pills, icon-left, value-right, larger tap target. No Bubble Card runtime dependency - pure CSS mimicry. Picks up the visual language of Bubble Card-heavy dashboards without forcing the install.

- [ ] Add `stats_grid.style: tile | pill` config (default `tile` = current behaviour; `pill` = Bubble Card-flavoured)
- [ ] Per-style CSS class set: rounded-rect / pill, icon-left layout, mobile full-width row
- [ ] Document both styles in README with screenshots

### Tier 2 - Real Bubble Card embed via auto-generated sensors

Deferred until at least one user explicitly asks for it. Approach: when `stats_renderer: bubble`, the card creates one HA helper per stat field, updates them on every pagination tick, and the user composes a Bubble Card sub-button row pointing at those sensors. Concerns: recorder bloat from rapid sensor updates, and whether a frontend card can (or should) create helpers at all.

## Features deferred from v1 design

- [ ] **Combined multi-source view** (`default_view: combined`) - interleave trips by timestamp across sources. The multi-source `sources: []` config is data-shape-agnostic, but trips currently render per-source serially.
- [ ] **Speed-coloured polyline** (`color_by: speed`). Toyota's per-route-point data lacks per-point speed; Strava's `streams` endpoint exposes `velocity_smooth` and could feed it.
- [ ] **Trip dropdown selector**. Tapping the label opens a list to jump to a specific trip. Useful past 10+ trips.
- [ ] Compare-two-trips overlay, map full-screen toggle: noted, currently considered over-scoped.

## Upstream integrations that would unlock more sources

### `craibo/ha_strava` - decode polyline + raise the 10-activity cap

The integration ships with `per_page=200` unpaginated, a 10-activity cap (`CONF_NUM_RECENT_ACTIVITIES_MAX`), and an encoded `summary_polyline` that consumers must decode themselves. A combined upstream PR (pagination flag, higher cap, decoded `route` attribute; see `scripts/strava-fixture.py:decode_polyline` for a reference decoder) would let this card consume Strava natively. Tracked upstream in [craibo/ha_strava#196](https://github.com/craibo/ha_strava/issues/196).

### `ha_toyota` - recent-trips producer sensor

A `sensor.<car>_recent_trips` exposing `attributes.trips[]` (metadata-only, with `toyota.get_trip_route` for lazy polylines to avoid recorder bloat - the shape this card's [lazy route loading](README.md#lazy-route-loading) expects).

## Open research questions (Toyota data)

- [ ] **Behaviour `type` codes**: sample data shows single letters `"A"` / `"B"`. Hypothesis: A=acceleration, B=braking. Need more samples to enumerate other types.
- [ ] **Behaviour `coachingMsg` / `diagnosticMsg` integers**: probably map to localised strings in the vendor app.
- [ ] **`mode` per route point**: observed values 0 and 1 (PHEV). Hypothesis: 0=eco/EV, 1=power/blended.

## HACS

- [x] hacs.json, README, LICENSE, screenshots, validation workflow, tagged release.
- [ ] **HACS default repo submission**. Optional - works fine as a custom repo.
- [ ] **CHANGELOG.md** once there's more than one release (release notes on GitHub releases until then).
