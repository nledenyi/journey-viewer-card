---
name: ha-custom-card
description: Build a Home Assistant Lovelace custom card from scratch with Lit + TypeScript, theme-aware styling, lifecycle-safe map/library embedding, ha-form-based visual editor, and chunked deployment to HA OS. Use when the user asks to create a new HA custom Lovelace card, integrate a third-party JS library (Leaflet, ApexCharts, etc.) into a card, or add a visual editor (`getConfigElement` / `getConfigForm`). Examples: "build a custom card for X", "make a Lovelace card that shows Y", "integrate Leaflet into a card", "add a visual editor to my card".
---

# Building HA custom Lovelace cards

A working playbook distilled from building `journey-viewer-card` end-to-end (Lit + Leaflet + threshold/bar/trend stats grid). Everything here was either load-bearing in production OR caught a real bug in testing.

## When to use this skill

The user wants to build, polish, or troubleshoot a Lovelace custom card. Triggers include:

- "Make a card that shows ..."
- "Integrate [library] into HA"
- "My custom card breaks after edit mode" / similar lifecycle bugs
- Theming or `card_mod` interaction questions
- Stats / threshold / progress-bar tile patterns

If the user just wants to compose existing cards (no new JS), use `ha-section-card` instead.

## Quick-start checklist (the work that's load-bearing)

A new card needs these to not be a hack:

1. **Project**: TypeScript ≥5.0, Lit 3, Vite 6 (or Rollup 4 — equivalent). Target `ES2022`. Single-file bundle output.
2. **Types**: `import type { HomeAssistant, LovelaceCard } from "custom-card-helpers"` — avoid `hass: any`.
3. **`setConfig()`**: validate required fields, throw on missing.
4. **`shouldUpdate()`**: scope to entities the card actually uses, otherwise every `hass` tick triggers a full re-render.
5. **`updated()` does the work**: idempotent `ensureMap() / ensureChart() / etc + render()`. Don't put init in `firstUpdated()` — it races with HA's grid layout.
6. **`disconnectedCallback` cleans up**, **`connectedCallback` rebuilds via rAF** — Lovelace edit-mode toggle disconnects and reconnects the element.
7. **`window.customCards.push(...)`** at module top level so the card picker finds it.
8. **Theme via CSS variables**: `--primary-color`, `--card-background-color`, etc. Never hardcode colours.
9. **Cache-bust** the resource URL (`?v=N`) on every deploy, otherwise users see stale code.

## Lifecycle: this is where bugs hide

### `setConfig()` must throw, not silently default

`setConfig()` is called every time the user edits the YAML. Validate required fields and throw a clear message. HA shows the throw in the UI editor — that's your spec for "what the user did wrong."

```ts
setConfig(config: CardConfig): void {
  if (!config?.sources?.length && !config?.fallback_fixture_url) {
    throw new Error("journey-viewer-card: 'sources' or 'fallback_fixture_url' required");
  }
  this.config = config;
}
```

### `shouldUpdate()` with entity-scoped change detection

Without this, every `hass` update — every entity changing somewhere unrelated to your card — triggers a full Lit re-render. For map / chart cards this means the embedded library rebuilds itself, losing pan/zoom state and burning CPU.

```ts
protected override shouldUpdate(changed: PropertyValues): boolean {
  if (!this.config) return true;
  if (changed.has("config") || changed.has("index") || changed.has("trips")) {
    return true;
  }
  if (changed.has("hass")) {
    const oldHass = changed.get("hass") as HomeAssistant | undefined;
    const ids = (this.config.sources ?? []).map(s => s.entity).filter(Boolean);
    return relevantEntitiesChanged(oldHass, this.hass, ids as string[]);
  }
  return false;
}
```

`hasConfigOrEntityChanged` from `custom-card-helpers` works for single-entity cards. Multi-entity (sources array, etc.) → write your own iteration.

### Init in `updated()`, not `firstUpdated()`

`firstUpdated()` + `requestAnimationFrame` looks correct in isolation but races with HA's grid layout. The rAF callback fires, the `@query`-decorated DOM ref isn't reliably populated, init silently fails. Symptom: card renders structure but the embedded element (map, chart) is missing.

**The pattern that works**: idempotent `updated()` that runs `ensureMap()` + `render()` every time. Each Lit render-cycle gets a fresh chance to init; the first one with a laid-out container succeeds.

```ts
protected override updated(_changed: PropertyValues): void {
  this.ensureMap();
  if (this.tripMap && this.currentTrip) this.tripMap.render(this.currentTrip);
}

private ensureMap(): void {
  if (!this.mapEl || this.tripMap) return;  // bail if already initialised or no DOM yet
  this.tripMap = new TripMap(this.mapEl, this.config?.map ?? {});
}
```

### **Lovelace edit-mode toggle disconnects and reconnects the card**

This is the single biggest lifecycle gotcha and it cost a lot of debug time. When the user enters edit mode and exits without saving:

1. `disconnectedCallback` fires — your map / chart instance gets destroyed by your cleanup code (correctly)
2. The card element is reattached
3. `connectedCallback` fires
4. **Lit's `updated()` does NOT auto-fire on reconnect** if no reactive prop changed
5. Your map / chart stays destroyed → the card looks blank

The fix is small: in `connectedCallback`, schedule a rAF that explicitly rebuilds.

```ts
override disconnectedCallback(): void {
  super.disconnectedCallback();
  this.tripMap?.destroy();
  this.tripMap = undefined;
}

override connectedCallback(): void {
  super.connectedCallback();
  // Lovelace edit-mode toggle disconnects + reconnects the element. Lit's
  // updated() doesn't refire on reconnect alone if no reactive prop
  // changed — but our disconnectedCallback already nuked the embedded
  // instance. Rebuild manually after the next paint.
  requestAnimationFrame(() => {
    this.ensureMap();
    const trip = this.currentTrip;
    if (this.tripMap && trip) this.tripMap.render(trip);
  });
}
```

That's it. ~5 lines of recovery code. Don't add IntersectionObserver, MutationObserver, or polling first — they're tempting but unnecessary; verify in Playwright that the simple version works before adding more.

### Don't over-engineer recovery

When the edit-mode bug surfaced, the temptation was to add four observers (RO + IO + MO + polling). All four fired correctly but none recovered, because `replayLastTrip()` checked `this.tripMap && trip` and bailed when the map was already destroyed. **The single missing piece was `ensureMap()` before render.** Adding three more observers wouldn't have fixed it; understanding the actual failure did.

Lesson: when adding multiple recovery layers, verify each catches what it's supposed to AND the recovery action actually works. Don't just stack observers.

## Embedding a third-party library (Leaflet, ApexCharts, etc.)

### Inline the library's CSS into the shadow DOM

Lit's shadow DOM means external `<link rel="stylesheet">` doesn't reach into the card. For libraries that ship CSS:

```ts
import leafletCss from "leaflet/dist/leaflet.css?inline";
// ...
static override styles = css`
  ${unsafeCSS(leafletCss)}
  /* card styles */
`;
```

A `*.css?inline` module declaration is required for TypeScript:

```ts
// src/leaflet-css.d.ts
declare module "*.css?inline" {
  const css: string;
  export default css;
}
```

### `isolation: isolate` on the host element

Counter-intuitive: putting Leaflet inside a Lit shadow DOM does NOT isolate stacking context. Shadow DOM scopes CSS but not z-index. Symptom: Leaflet's `z-index: 1000` controls (zoom buttons, attribution) escape upward and overlap HA's side drawer.

Fix on the wrapper that contains the embedded library:

```css
.tv-map-wrap {
  isolation: isolate;
  position: relative;
  z-index: 0;
}
```

Treat this as default-on for any card embedding a library with internal `z-index` (Leaflet, ApexCharts, dropdowns, video overlays). Not a fix-on-symptom.

### Library inside a positioned wrapper, overlays as siblings

Tempting to absolute-position a corner overlay (legend, status badge) directly on the same div that hosts Leaflet. Don't — Leaflet mutates the host (adds classes, sets `position: relative`, attaches event handlers). Better:

```html
<div class="tv-map-wrap">     <!-- fixed height + isolation: isolate + position: relative -->
  <div class="tv-map"></div>  <!-- 100% × 100% inner, library host -->
  <div class="tv-legend">...</div>  <!-- absolute, top/right, pointer-events: none -->
</div>
```

`pointer-events: none` on the overlay lets pan/zoom drag pass through.

### Triple `invalidateSize()` for size-aware libraries

Leaflet's internal `_size` cache lags the actual container size for several frames inside HA's shadow-DOM-inside-grid-layout. The bulletproof pattern is three checkpoints, all idempotent:

```ts
m.invalidateSize();              // immediate
setTimeout(() => m.invalidateSize(), 0);    // post-layout macrotask
requestAnimationFrame(() => m.invalidateSize()); // post-paint
```

Plus a `ResizeObserver` on the container that calls invalidateSize on every legitimate size change (mobile rotate, theme switch, sidebar collapse).

### Tile / data-source attribution: keep it on, style it small

Tile providers (OSM, CARTO, Mapbox) require attribution per their usage policies. Don't disable it — that's grounds for HACS rejection and tile-server rate limiting. Style it tiny instead:

```css
.leaflet-control-attribution {
  font-size: 8px !important;
  opacity: 0.4;
  transition: opacity 150ms ease;
}
.leaflet-control-attribution:hover { opacity: 0.9; }
```

CARTO's tiles use OpenStreetMap data — attribution must credit BOTH ("© OSM, CARTO"). Don't drop one to save space.

For dashboards with many maps, switch tile provider from `openstreetmap` to `carto-positron` (light) or `carto-dark-matter` (dark). OSM rate-limits hard when there are 6+ maps on one view; CARTO doesn't. CARTO's near-monochrome backgrounds also make polylines pop.

### Disable interaction in "embedded card" mode

Default for an embedded Lovelace card should be `gestures: locked`. That means ALL of:

```ts
const locked = cfg.gestures === "locked";
const m = L.map(container, {
  scrollWheelZoom: !locked,
  dragging: !locked,
  touchZoom: !locked,
  doubleClickZoom: !locked,
  boxZoom: !locked,
  keyboard: !locked,
});
```

Just disabling `scrollWheelZoom` is not enough — single-finger touch on mobile still pans the map and breaks page scroll. The +/- zoom buttons remain functional regardless because they're a separate UI element bound to `map.zoomIn/Out`, not gesture-captured.

## Theming

### CSS variables, never hardcoded colors

Use HA's standard tokens:

| Token | For |
|---|---|
| `--primary-color` | accent — buttons, links, hover states |
| `--text-primary-color` | text on filled-accent backgrounds |
| `--primary-text-color` | normal body text |
| `--secondary-text-color` | labels, captions, muted text |
| `--secondary-background-color` | tile backgrounds |
| `--card-background-color` | overlay panels, popups |
| `--divider-color` | borders, separators |
| `--disabled-text-color` | disabled state text/borders |
| `--error-color`, `--warning-color`, `--success-color` | semantic |
| `--ha-card-border-radius` | panel rounding |
| `--mdc-icon-size` | `<ha-icon>` sizing |

Light/dark/custom theme support is automatic. Test in both before declaring done.

### Expose card-specific overrides as `--<card-name>-*` variables

For colors / radii that aren't covered by HA tokens, expose your own custom properties. Three-tier resolution chain (highest to lowest precedence):

1. **YAML config** (per-card, e.g. `bar.color: "#ff0000"`)
2. **CSS custom property** (theme YAML or `card_mod` global, e.g. `--journey-viewer-polyline-ev: hotpink`)
3. **Hardcoded fallback**

Implementation pattern: in JS, read `getComputedStyle(host).getPropertyValue('--journey-viewer-polyline-ev')` to resolve the var; in CSS, just use `var(--journey-viewer-polyline-ev, fallback)`. Both work.

### `color-mix()` for translucency and gradients

CSS Color Module 5's `color-mix()` is supported in HA's browser baseline (2024+). Two power moves:

```css
/* Apply alpha to any color (theme var, hex, named) */
background: color-mix(in srgb, var(--jv-tile-bg) 25%, transparent);

/* Smooth gradient between threshold colors */
color: color-mix(in srgb, var(--success-color) 70%, var(--warning-color));
```

Cleaner than computing rgba in JS. The browser interpolates at paint time so users dragging a slider see live gradients without re-rendering.

### Default `:active` and `:focus` look identical to disabled

Counter-intuitive footgun for any "outlined button → filled-accent on hover" pattern. Without explicit rules, browsers fall back to grey for `:active` and `:focus` — near-identical to your `[disabled]` styling. A freshly-clicked button briefly looks like it just got disabled. Reads as "did the button stop working?"

```css
.btn:hover:not([disabled]),
.btn:active:not([disabled]),
.btn:focus-visible:not([disabled]) {
  background: var(--primary-color);
  color: var(--text-primary-color);
  outline: none;
}
.btn:focus:not(:focus-visible) { outline: none; }  /* drop default ring on mouse focus */
```

### Pager / button contrast in dark themes

`--secondary-background-color` is dark in dark themes and very light in light themes. Using it for both enabled and disabled with only opacity to distinguish is unreliable — disabled in dark mode is "near-black at 0.4 opacity" which is near-identical to enabled at full opacity.

Better: enabled uses `--primary-color` (HA accent — vivid blue), disabled uses `--disabled-text-color` (theme-aware grey).

## Stats / threshold / bar / trend tile pattern

For data-display tiles (score, percentage, range), four decorators compose:

1. **Threshold ladder** with `value:` lower bound (mini-graph-card / ApexCharts idiom — avoid `ge:` / `gt:` operators that programmer-types use; users don't recognise them)
2. **Color target** (`value` text vs whole `tile`) + **color mode** (`solid` jumps; `gradient` interpolates between adjacent thresholds)
3. **Bar background** via multi-layer `background:` — gradient overlay on top of `color-mix` tile bg
4. **Trend arrow** vs previous data point in the loaded list (don't compute "average" on the frontend; that's a backend concern)

```yaml
- key: scores.global
  thresholds:
    - { value: 0,  color: var(--error-color), icon: mdi:alert }
    - { value: 50, color: var(--warning-color) }
    - { value: 80, color: var(--success-color), icon: mdi:medal }
  color_target: value
  color_mode: solid
  bar:
    max: 100
    color: auto       # follows thresholds + color_mode
    track: rgba(0,0,0,0.06)
  trend:
    position: after_value
    show_delta: true
    invert: false     # true if lower = better (fuel use, commute time)
```

### Bar+threshold redundancy: suppress duplicate coloring

When `bar.color: auto`, the bar already carries the color signal. Applying `color_target` ALSO would put the same color on the value text, against a same-color bar fill — text becomes near-invisible. Detect and suppress:

```ts
const barUsesAuto = !!bar && (!bar.color || bar.color === "auto");
const colorOnTextOrTile = barUsesAuto ? undefined : decorationColor;
```

Users who explicitly want both can set `bar.color` to a different color.

### Trend delta needs a separate format from the row format

Row formats often include suffixes that don't apply to deltas:
- `"{v} / 100"` — `/ 100` is the score's max, not a unit; `↓ 1 / 100` reads as another score
- `"L"` — divides by 1000 + ` L` suffix; SHOULD apply to delta (unit is correct)
- `"km"` — same
- `"duration"` — formats seconds as `m:ss`; SHOULD apply

Heuristic: inherit row.format only when it's a unit-converter preset (`km`, `L`, `duration`); never for templates with max-suffixes. Users with unusual formats set `trend.format` explicitly.

```ts
const explicit = row.trend?.format;
const inheritsRowFormat = ["km", "L", "duration"].includes(row.format ?? "");
const fmt = explicit ?? (inheritsRowFormat ? row.format : undefined);
```

### Smart numeric defaults for delta precision

When falling back to plain numeric:
- Integer delta → no decimals (score change of 1, not 1.00)
- Float delta → 2 decimals (speed change of 0.29, not 0.290000000000006625 from `String(float)`)

```ts
const smartDecimals = row.decimals ?? (Number.isInteger(info.delta) ? 0 : 2);
```

## Mobile responsiveness via CSS only

Cards need to look right at desktop dashboard widths (~480 px column) and full-mobile (~390 px). Achieve this with CSS only — no JS resize listeners.

```css
.tv-stats {
  display: grid;
  grid-template-columns: repeat(var(--tv-cols, 4), 1fr);
  gap: 8px;
}
@media (max-width: 600px) {
  .tv-stats { grid-template-columns: repeat(var(--tv-cols-mobile, 2), 1fr); }
}
```

Map height stays fixed (e.g. 280px) at all viewports; the wrapper is `width: 100%` so the map naturally narrows. The library's own ResizeObserver handles the recalculated bounds.

## Card discovery + registration

### `window.customCards.push({...})` at module top level

Without this push, the card works in YAML but doesn't appear in the "Add Card" picker. At module top level (NOT inside the class):

```ts
window.customCards = window.customCards || [];
window.customCards.push({
  type: "journey-viewer-card",
  name: "Journey Viewer",
  description: "Paginated GPS journey viewer (drives, rides, runs)",
  preview: true,  // user sees a live preview when picking from gallery
});
```

### Resource registration is one-time

After first deploy: register `/local/community/<name>/<name>.js` as a Lovelace resource. Subsequent deploys: just overwrite the file. Browsers cache aggressively — append `?v=<sha>` to the URL or bump the resource record on each deploy.

For HA dashboards in storage mode, programmatic registration via the WebSocket API:

```ts
ha_config_set_dashboard_resource({
  url: "/local/community/journey-viewer-card/journey-viewer-card.js?v=23",
  resource_type: "module",
});
```

For local dev: hard-refresh (Ctrl+Shift+R desktop, app cache clear on mobile) is your friend.

## Visual config editor (`getConfigElement`)

A real editor is the difference between "another mod" and "a card people install in the GUI without reading the README". HA exposes two paths in [the official docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/):

| API | When |
|---|---|
| `static getConfigForm()` returns `{ schema, computeLabel, assertConfig }` | Flat-ish configs, mostly entity/text/select/number selectors. HA renders the form. |
| `static getConfigElement()` returns a Lit element | Nested arrays of rich objects, custom widgets, conditional reveals. Full control. |

For anything with arrays of rich objects (a `rows[]` builder, a `sources[]` list), `getConfigElement` is the answer. Schema-driven `getConfigForm` collapses arrays to opaque `object` selectors which is YAML in disguise.

### Hybrid pattern: ha-form for sections + custom widgets for arrays + YAML fallback

The pattern that scales: one Lit element returns a column of sub-forms. Each non-array section is a small `ha-form` schema; each array section is a hand-rolled list with add/remove/reorder. A "Show YAML" button at the bottom drops to `ha-code-editor` for the long tail.

```
┌─ JourneyViewerCardEditor (host) ────────────────────┐
│  <ha-form>           top-level fields               │
│  <ha-expansion-panel header="Sources">              │
│    custom list builder (add / remove / reorder)     │
│      └─ <ha-form schema=SOURCE_SCHEMA>  per row     │
│  </ha-expansion-panel>                              │
│  <ha-expansion-panel header="Pagination">           │
│    <ha-form schema=PAGINATION_SCHEMA>               │
│  </ha-expansion-panel>                              │
│  ... map / label / rows / empty_state ...           │
│  <ha-button>Show YAML</ha-button>                   │
└─────────────────────────────────────────────────────┘
```

Key call: each section gets its OWN `ha-form` bound to its OWN data slice. Don't try to drive the entire config from one giant nested `expandable + flatten: false` schema — the data binding gets ugly fast.

### `inlineDynamicImports` so the editor doesn't fork the bundle

If `getConfigElement` does `await import('./editor/editor.js')`, Vite/Rollup chunk-splits and you ship two files instead of one. HA's resource registration is single-URL — you'd have to deploy and version both. Force a single bundle:

```ts
// vite.config.ts
rollupOptions: {
  output: { inlineDynamicImports: true },
}
```

Bundle grows by the editor's size (~10 KB raw / 3 KB gzipped for journey-viewer's editor pre-decorators, ~25 KB / 6 KB after decorators). Worth it for the single-resource simplicity.

### Plain CustomEvent, not `fireEvent`

`fireEvent` from `custom-card-helpers` is generic over `HASSDomEvents`, and `config-changed` isn't in the default keys. Don't fight the type system — dispatch the event directly:

```ts
function fireConfigChanged(node: HTMLElement, config: unknown): void {
  node.dispatchEvent(new CustomEvent("config-changed", {
    detail: { config },
    bubbles: true,
    composed: true,
  }));
}
```

`bubbles + composed` is non-negotiable — the host card-edit dialog listens on its boundary, the event must cross your shadow root.

### Schema primitives worth knowing

```ts
{ name: "title",   selector: { text: {} } }
{ name: "color",   selector: { text: { type: "color" } } }       // native HTML <input type=color>
{ name: "height",  selector: { number: { min: 120, max: 800, mode: "slider", step: 10 } } }
{ name: "wrap",    selector: { boolean: {} } }
{ name: "icon",    selector: { icon: {} } }                       // mdi picker
{ name: "entity",  selector: { entity: {} } }                     // entity picker (needs hass)
{ name: "fmt", selector: { select: {
  custom_value: true,                                             // dropdown + free-text fallback
  mode: "dropdown",
  options: [{ value: "{v:.0%}", label: "Percent ({v:.0%})" }],
}}}

{ type: "grid",       schema: [...] }                             // 2-col layout
{ type: "expandable", title: "Map",  schema: [...] }              // collapsible panel inside ha-form
```

`select` with string options renders as radios for short lists, dropdown when there are many. Force with `mode: "dropdown"`.

### `computeLabel` for human field names

ha-form labels default to the schema field name (`tile_provider`, `color_target`, etc.). Override with a single LABELS map keyed by field name:

```ts
const LABELS: Record<string, string> = {
  tile_provider: "Tile provider",
  color_target:  "Colour target",
  show_delta:    "Show numeric delta",
  // ...
};
const computeLabel = (s: { name: string }): string => LABELS[s.name] ?? s.name;
```

One label-namespace gotcha: if multiple schemas use the same field name (e.g. `position` for both pagination and trend), you can only have one entry — pick a label that makes sense in both, or rename the field in one schema.

### Strip empty values before merging back

ha-form's `value-changed` event sends `{ name: "" }` when the user clears a text field, `{ decimals: undefined }` when they clear a number. Don't stamp those back blindly — your YAML fills up with `field: null` cruft and the runtime can't tell "explicitly null" from "not set":

```ts
private _stripEmpty(o: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === "" || v === null) continue;
    out[k] = v;
  }
  return out;
}
```

For sub-objects (`bar`, `trend`): if the patch is empty after stripping, **delete the parent key entirely** instead of writing `bar: {}`. Empty sub-objects make round-tripped YAML noisy and confuse the runtime.

### Catalogue pattern for "name your metric, not the YAML key"

When a row points at one of N predefined metrics — but the YAML supports two different shapes (`key: dot.path` vs `computed: enum_name`) — don't expose the split to the user. A single named-metric dropdown that knows which YAML key to write is far better UX:

```ts
const STAT_CATALOGUE = [
  { id: "distance",  label: "Distance",  key: "stats.distance_m",
    defaultFormat: "km", defaultIcon: "mdi:map-marker-distance" },
  { id: "ev_ratio",  label: "EV ratio",  key: "stats.ev_distance_m",
    ratio_of: "stats.distance_m", defaultFormat: "{v:.0%}",
    defaultIcon: "mdi:lightning-bolt", description: "EV km ÷ total km" },
  { id: "__custom__", label: "Custom path…", key: "" },   // escape hatch
];
```

Picking an entry stamps `key` (and optionally `ratio_of`) plus seeds `label`/`format`/`icon`/`decimals` defaults — but only when those fields aren't already set, so users never lose customisation when switching metric.

The "Custom path…" escape hatch reveals raw `key`/`ratio_of` text fields. Reading the row back to find which catalogue entry it represents is a `(key, ratio_of) → entry` lookup; if no match, treat as custom.

### List builders for arrays (sources, rows, thresholds)

The shape that works for sources / stats rows / thresholds:

```html
<div class="list">
  <!-- one card per item -->
  <div class="row">
    <div class="row-head">
      <span>{name or autoindex}</span>
      <ha-icon-button>↑</ha-icon-button>     <!-- moveUp(i) -->
      <ha-icon-button>↓</ha-icon-button>     <!-- moveDown(i) -->
      <ha-icon-button>🗑</ha-icon-button>    <!-- remove(i) -->
    </div>
    <ha-form schema=ROW_SCHEMA data=row[i] @value-changed=onRowChange(i)>
  </div>
  <ha-button @click=add>+ Add</ha-button>
</div>
```

Reorder via `[arr[i], arr[j]] = [arr[j], arr[i]]` swap. Don't introduce a drag library for v1 — up/down buttons are fine and add zero deps.

For tightly nested lists (thresholds inside a row), wrap each entry in its own card with a small uppercase label tag (`THRESHOLD 1`) so the user has a visual anchor when scanning. Keep controls horizontal in a header bar — vertical stacks of three buttons waste space.

### Manual-mount testing has limits

Mounting the editor element directly into a page (not via the HA card-edit dialog) covers ~90% of behaviour: forms render, selectors work, value-changed events fire, merging logic works. But:

- **Entity picker renders 0×0** outside the real edit dialog. `ha-entity-picker` needs a registry context (entity registry, device registry, area registry) that only the actual dialog wires up. The DOM elements are present; they just don't display.
- **Lovelace context (saveConfig, edit-mode flags) is missing.** Anything you read from `this.lovelace` won't work in a manual mount.

So: use Playwright manual mount for fast iteration on layout, schemas, and event flow. Verify in the real card-edit dialog before declaring done. Same applies to writing reproductions of editor bugs — open an actual edit dialog or you'll waste time chasing missing-context bugs.

### `getStubConfig` for "Add card" picker

When the user picks the card from the gallery, HA calls `getStubConfig()` and pre-populates the editor. Return the minimum that makes the editor immediately useful:

```ts
static getStubConfig(): Partial<CardConfig> {
  return {
    type: "custom:journey-viewer-card",
    sources: [{ name: "Vehicle", entity: "" }],   // empty entity → picker opens with focus
  };
}
```

Don't return a "demo data" config — fresh users want to wire their own entity, not see someone else's example.

## Build + deploy

### Vite or Rollup, both fine

Boilerplate-card uses Rollup 4. Vite 6 gives identical bundle output. Pick what you know.

What matters for the bundle:
- Target `ES2022` (Lit 3 needs native classes; older targets break decorator semantics)
- Single-file output (one resource URL, simpler than module-split)
- Bundle library + Lit + card into the same file (saves a CDN round-trip)

### TypeScript strict + `override`

`useDefineForClassFields: false` for decorator compatibility. `noImplicitOverride: true` catches "I forgot `override` on `connectedCallback`" at compile time.

### Chunked transfer to HA OS

Bundle deployment via `qm guest exec 101 -- docker exec ...` runs into bash arg-list limits at ~128 KB. Anything larger needs chunked transfer:

```sh
SRC=dist/journey-viewer-card.js
CHUNK_DIR=$(mktemp -d)
split -b 50000 "$SRC" "$CHUNK_DIR/chunk-"
sudo qm guest exec 101 -- docker exec homeassistant sh -c \
  "rm -f /config/www/community/foo/foo.js && touch /config/www/community/foo/foo.js" >/dev/null
for f in "$CHUNK_DIR"/chunk-*; do
  B64=$(base64 -w0 < "$f")
  sudo qm guest exec 101 -- docker exec homeassistant sh -c \
    "echo '$B64' | base64 -d >> /config/www/community/foo/foo.js" >/dev/null
done
```

50 KB chunks fit comfortably; 8 chunks = 400 KB single-file bundle. Verify via `stat -c '%s'` on both ends.

Long-term cleaner option: SSH addon → `scp` directly. For one-developer workflows the chunked transfer is fine.

## Dev preview without HA

For pure UI iteration, Vite-served preview against a local fixture beats an HA round-trip every time:

```
dev/index.html    — body with <journey-viewer-card>
dev/main.ts       — imports the card, calls setConfig() with fixture URL
public/sample.json — fixture, served at /sample.json by vite dev
```

`npm run dev` → hot-reload at localhost:5173, no HA needed. The card's `fallback_fixture_url` config option (or whatever you name it) is the escape hatch for both local dev AND HACS try-before-buy users who don't have the producing integration installed.

## Anti-patterns (real bugs we hit)

- **Re-creating the embedded library on every render.** Easy mistake. Lazy-init guarded by `if (this.libInstance) return;`, then call `library.update(data)` instead of recreating.
- **Trusting one `invalidateSize()` is enough.** In HA's shadow-DOM-inside-grid-layout, Leaflet's `_size` cache lags real size by several frames. Triple-checkpoint pattern (now / `setTimeout(0)` / `rAF`) is bulletproof; one alone is not.
- **Cache-busting custom-card resources.** Without `?v=N` URL bump, HA serves cached bundle indefinitely. Build a deploy script that increments automatically.
- **Setting Leaflet polyline `padding` in pixels using percent math** (`padding: [pad * 100, ...]` when `pad=0.1`). Leaflet's `padding` is in pixels directly.
- **`tap: true` in Leaflet `MapOptions`.** Not in current types; remove or `as any`. Default behaviour handles tap fine.
- **`document.addEventListener` for keyboard shortcuts** — works but is global. `this.addEventListener` doesn't bubble through the host. Pick deliberately based on whether the shortcut should fire when card is focused vs always.
- **Using `String(float)` to format numbers** — gives 0.290000000000006625. Use `.toFixed(n)` or a format helper.
- **Inheriting row format on trend deltas** — `"{v} / 100"` template's `/ 100` suffix doesn't apply to a delta, makes it read as another score. Inherit only unit-converter presets.
- **Computing "average" or "best" comparisons on the frontend** — depends on how many records happened to be loaded; misleading. Push to a backend sensor / template.

## Things that look important but aren't (yet)

- **`getCardSize()` accuracy**: Lovelace uses this for masonry layout. Approximate is fine.
- **Visual config editor on day one**: YAML works. Build the card first, ship it, then add `getConfigElement()` once the config schema has stabilised. Building the editor against a moving schema is wasted work — fields you add a GUI for end up renamed two iterations later. (See "Visual config editor" section above for how to add it once the schema's locked.)
- **Localisation**: nice for HACS gallery, mandatory for nothing. Hardcode English in v1.
- **Tap/hold action handlers**: only matter if the card has clickable per-entity actions. Skip until needed.
- **Recovery layers beyond `connectedCallback` rAF**: started with 4 (RO + IO + MO + polling), needed 1. Don't pre-build defenses; add specific fixes for specific bugs you can reproduce.

## Open questions / not yet learned

- Best pattern for HACS submission flow — when to tag, what `info.md` should look like, do they accept Vite-built bundles unchanged.
- Whether `getGridOptions()` (sections layout) is worth implementing for cards with a natural aspect ratio.
- Whether HA's edit dialog will resize gracefully when the editor host element grows tall (decorator sub-panels expanded). Worst case: dialog scrolls. Acceptable but not yet observed in the real dialog.
- `getConfigForm()` (schema-only, no Lit element) viability for simple cards — bubble-card avoided it but the docs strongly recommend it for "single-screen" cards. Could prototype to confirm where the cliff is.
- Recorder bloat avoidance when the producer integration exposes rich-attribute sensors (our trip data is 234 KB; recorder will index every poll).
- Bubble-Card-style sub-button embedding for stats pills — Tier 1 (CSS mimicry, no dep) is easy; Tier 2 (real Bubble Card via auto-helper sensors) requires a backend integration.

## File template (project skeleton)

When scaffolding a fresh card, the structure that's been load-bearing:

```
my-card/
├── package.json              "type": "module", deps: lit, custom-card-helpers, [library]
├── tsconfig.json             ES2022, strict, useDefineForClassFields: false, noImplicitOverride: true
├── vite.config.ts            lib mode, ES output, single-file, fileName: "my-card.js"
├── hacs.json                 { name, render_readme: true, filename, homeassistant: "2024.1.0" }
├── README.md                 install instructions + YAML config schema with examples
├── LICENSE                   MIT
├── src/
│   ├── card.ts               LitElement subclass, @customElement, window.customCards.push
│   ├── types.ts              CardConfig + sub-types
│   ├── format.ts             formatters (relative day, distance, duration, etc.)
│   ├── lookup.ts             dot-path access into config-driven data
│   ├── leaflet-css.d.ts      (or chart-css.d.ts) declare module "*.css?inline"
│   └── editor/               (after schema stabilises — see Visual config editor section)
│       ├── editor.ts         <foo-card-editor> element, getConfigElement() returns this
│       ├── schema.ts         ha-form schemas + LABELS map (one per non-array section)
│       ├── stat-catalogue.ts named-metric catalogue (if applicable, for option-B picker)
│       └── fire.ts           plain CustomEvent('config-changed') helper
├── dev/
│   ├── index.html            <my-card> + style shim for ha-icon outside HA
│   └── main.ts               import card, setConfig with fixture URL, hot-reload
├── public/
│   └── sample.json           fixture data matching the card's data contract
├── docs/
│   └── learnings.md          this file (or a project-specific variant)
└── TODO.md                   deferred features + known limitations
```
