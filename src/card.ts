import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import type { ActionConfig, HomeAssistant, LovelaceCard } from "custom-card-helpers";
import { hasAction } from "custom-card-helpers";
import leafletCss from "leaflet/dist/leaflet.css?inline";
import type { CardConfig, RoutePoint, StatsRow, Trip } from "./types.js";
import { TripMap } from "./map.js";
import { formatStat, renderLabel, validateLabelTemplate } from "./format.js";
import { getByPath } from "./lookup.js";
import { sortTrips, normalizeFromHass } from "./data.js";
import { actionHandler } from "./action-handler-directive.js";
import {
  barPct,
  computeTrend,
  gradientColor,
  matchThreshold,
  resolveMax,
  type TrendInfo,
} from "./decorators.js";

/** Bumped on each release; surfaced in the HACS console banner. */
const CARD_VERSION = "0.1.0";

/** Layout constants used by getCardSize() to estimate a stable Lovelace size. */
const CARD_HEADER_HEIGHT_PX = 60;
const STATS_ROW_HEIGHT_PX = 50;
const STATS_GRID_DEFAULT_COLS = 4;
const DEFAULT_MAP_HEIGHT_PX = 280;

/** Watch only the entities our sources point at, not the whole hass tree. */
function relevantEntitiesChanged(
  oldHass: HomeAssistant | undefined,
  newHass: HomeAssistant | undefined,
  entityIds: string[],
): boolean {
  if (!oldHass) return true;
  if (!newHass) return false;
  for (const id of entityIds) {
    if (oldHass.states[id] !== newHass.states[id]) return true;
  }
  return false;
}

const DEFAULT_LABEL_TPL = "{relative_day} {start_time} ({distance} / {duration})";

/** Cached per-row decorations for one (trip, prevTrip) pair. Building a map
 *  per render keyed on the trip reference is cheap; recomputing thresholds,
 *  gradients, bar layers, and trend info on every reactive change is not. */
interface RowComputed {
  formatted: string;
  decorationColor?: string;
  effectiveIcon?: string;
  colorTarget: "value" | "tile";
  barBgLayer?: string;
  barUsesAuto: boolean;
  trendInfo?: TrendInfo;
}

export class JourneyViewerCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private config?: CardConfig;
  @state() private index = 0;
  @state() private trips: Trip[] = [];

  @query(".tv-map") private mapEl?: HTMLElement;
  private tripMap?: TripMap;
  /** Memoized stats-row decorations, keyed on (trip, prevTrip) reference pair.
   *  Cleared whenever `trips` changes (refreshTrips() reassigns the array). */
  private rowCache?: { trip: Trip; prevTrip?: Trip; rows: WeakMap<StatsRow, RowComputed> };
  /** Lazy-loaded route polylines, keyed by trip id. Populated by
   *  `maybeLoadRoute()` calling the source's `route_service`. Persists across
   *  trip-array refreshes so navigating back to a previously-viewed trip
   *  doesn't re-issue the service call. Lifetime is the card instance. */
  private routeCache = new Map<string, RoutePoint[]>();
  /** Trip ids whose route fetch is currently in flight; debounces
   *  duplicate kickoffs from successive `updated()` cycles. */
  private routeFetchInFlight = new Set<string>();
  private keyboardListenerActive = false;

  // ─── Lovelace lifecycle ────────────────────────────────────────────────

  /** The visual editor lives in its own ESM bundle. Lazy-load it the first
   *  time a user opens the edit dialog; keeps the main card bundle small. */
  static async getConfigElement(): Promise<HTMLElement> {
    await import("./editor/editor.js");
    return document.createElement("journey-viewer-card-editor");
  }

  static getStubConfig(): Partial<CardConfig> {
    return {
      type: "custom:journey-viewer-card",
      sources: [{ name: "Vehicle", entity: "" }],
    };
  }

  setConfig(config: CardConfig): void {
    if (!config?.sources?.length) {
      throw new Error("journey-viewer-card: 'sources' is required");
    }
    if (config.label?.template) {
      const unknown = validateLabelTemplate(config.label.template);
      if (unknown.length) {
        throw new Error(
          `journey-viewer-card: unknown label template token(s): ${unknown.join(", ")}`,
        );
      }
    }
    this.config = config;
    this.index = config.default_index ?? 0;
    this.rowCache = undefined;
  }

  getCardSize(): number {
    const stats = this.config?.stats_grid?.rows?.length ?? 0;
    const mapH = this.config?.map?.height ?? DEFAULT_MAP_HEIGHT_PX;
    const statsHeight =
      Math.ceil(stats / STATS_GRID_DEFAULT_COLS) * STATS_ROW_HEIGHT_PX;
    return Math.ceil(
      (mapH + CARD_HEADER_HEIGHT_PX + statsHeight) / STATS_ROW_HEIGHT_PX,
    );
  }

  /** Sections-view layout hints (HA 2024.7+). `rows: "auto"` lets HA's
   *  grid CSS size the cell to the actual rendered card height. Same
   *  pattern HA's built-in entities-card uses for variable-height content
   *  — avoids the pixel-arithmetic trap of static heuristics that overflow
   *  whenever a config edge case pushes the card past the estimate. */
  getGridOptions(): {
    rows?: number | "auto";
    columns?: number;
    min_rows?: number;
    min_columns?: number;
    max_rows?: number;
    max_columns?: number;
  } {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  // ─── State updates ─────────────────────────────────────────────────────

  /** Re-render only when something we actually care about changed. */
  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (!this.config) return true;
    if (
      changed.has("config") ||
      changed.has("index") ||
      changed.has("trips")
    ) {
      return true;
    }
    if (changed.has("hass")) {
      const oldHass = changed.get("hass") as HomeAssistant | undefined;
      const entityIds = (this.config.sources ?? [])
        .map((s) => s.entity)
        .filter((e): e is string => !!e);
      return relevantEntitiesChanged(oldHass, this.hass, entityIds);
    }
    return false;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("hass") || changed.has("config")) {
      this.refreshTrips();
    }
    if (changed.has("config")) {
      this.syncKeyboardListener();
    }
  }

  /** Keep the document-level keyboard listener in sync with
   *  config.pagination.keyboard. Called from willUpdate (config change) and
   *  from connectedCallback (re-attach after Lovelace edit-mode toggle).
   *  Idempotent: safe to call repeatedly. */
  private syncKeyboardListener(): void {
    const wanted = !!this.config?.pagination?.keyboard;
    if (wanted && !this.keyboardListenerActive) {
      document.addEventListener("keydown", this.handleKey);
      this.keyboardListenerActive = true;
    } else if (!wanted && this.keyboardListenerActive) {
      document.removeEventListener("keydown", this.handleKey);
      this.keyboardListenerActive = false;
    }
  }

  protected override updated(_changed: PropertyValues): void {
    // Idempotent init + render. Called after every render, including the
    // first. ensureMap() bails if the map is already constructed; render()
    // bails if the container has zero size and queues an rAF retry. This
    // double-bail strategy is more reliable than scheduling rAFs from
    // firstUpdated, which races with Lit's internal property batch updates
    // inside HA's grid sections layout.
    this.ensureMap();
    const trip = this.currentTrip;
    if (this.tripMap && trip) {
      this.tripMap.render(this.resolveTrip(trip));
      // Lazy-load the route polyline if the trip arrived without it (HA
      // ships only metadata in attributes; the full polyline lives in the
      // integration's cache and is fetched on demand via route_service).
      this.maybeLoadRoute(trip);
    }
  }

  /** Return ``trip`` with ``route`` filled from the lazy-load cache.
   *  If the trip already has a route (fixture mode) it's returned as-is.
   *  If the cache hasn't loaded yet, route is left empty so the map
   *  renders endpoints only - the next `updated()` after fetch
   *  completion replaces it with the full polyline.
   */
  private resolveTrip(trip: Trip): Trip {
    if (trip.route?.length) return trip;
    const cached = this.routeCache.get(trip.id);
    if (cached) return { ...trip, route: cached };
    return trip;
  }

  /** Kick off a route fetch for ``trip`` if not already cached / in-flight.
   *  No-op when the trip has no route (route_point_count missing or 0),
   *  when the trip already has a route, when the source has lazy-loading
   *  disabled, or when the device id can't be resolved.
   */
  private maybeLoadRoute(trip: Trip): void {
    if (trip.route?.length) return;
    if (!trip.route_point_count) return;
    if (!trip.id || this.routeCache.has(trip.id)) return;
    if (this.routeFetchInFlight.has(trip.id)) return;
    if (!this.hass || !this.config) return;

    const source = (this.config.sources ?? []).find(
      (s) => (s.name ?? null) === trip.source,
    );
    if (!source?.entity) return;
    const serviceName = source.route_service ?? "toyota.get_trip_route";
    if (!serviceName) return; // Empty/null disables lazy-load.

    // hass.entities is a Record<entity_id, EntityRegistryDisplayEntry> in
    // HA 2023.4+ but isn't typed in custom-card-helpers yet.
    const entityReg = (this.hass as unknown as {
      entities?: Record<string, { device_id?: string }>;
    }).entities?.[source.entity];
    const deviceId = entityReg?.device_id;
    if (!deviceId) return;

    const [domain, service] = serviceName.split(".");
    if (!domain || !service) return;

    this.routeFetchInFlight.add(trip.id);
    // HA's hass.callService(...) accepts (domain, service, data, target,
    // notifyOnError, returnResponse) - the 6th arg is missing from
    // custom-card-helpers's types but present at runtime since 2024.4.
    const callService = (this.hass as unknown as {
      callService: (
        domain: string,
        service: string,
        data: Record<string, unknown>,
        target?: unknown,
        notifyOnError?: boolean,
        returnResponse?: boolean,
      ) => Promise<{ response?: { route?: RoutePoint[] } }>;
    }).callService;

    callService(
      domain,
      service,
      { device_id: deviceId, trip_id: trip.id },
      undefined,
      false,
      true,
    )
      .then((resp) => {
        const route = resp?.response?.route ?? [];
        this.routeCache.set(trip.id, route);
        // Force a re-render so the resolved trip with full route gets
        // pushed to the map.
        this.requestUpdate();
      })
      .catch((err: unknown) => {
        // Network glitch / service unavailable / invalid trip id.
        // Don't throw - leave the trip routeless, log once for debugging.
        // Next navigation back to this trip will retry.
        console.warn(
          `journey-viewer-card: ${serviceName} failed for trip ${trip.id}`,
          err,
        );
      })
      .finally(() => {
        this.routeFetchInFlight.delete(trip.id);
      });
  }

  private refreshTrips(): void {
    if (!this.config) return;
    const fromEntity = normalizeFromHass(this.hass, this.config.sources ?? []);
    this.trips = sortTrips(fromEntity, this.config.order ?? "newest_first");
    this.index = Math.min(this.index, Math.max(0, this.trips.length - 1));
    // Trip array reassigned -> bust per-row decoration cache.
    this.rowCache = undefined;
  }

  private ensureMap(): void {
    if (!this.mapEl || this.tripMap) return;
    this.tripMap = new TripMap(this.mapEl, this.config?.map ?? {});
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.tripMap?.destroy();
    this.tripMap = undefined;
    document.removeEventListener("keydown", this.handleKey);
    this.keyboardListenerActive = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncKeyboardListener();
    // Recover from Lovelace edit-mode toggle: the card was disconnected
    // (which destroyed the TripMap) and now reconnected. Lit's updated()
    // doesn't refire on reconnect alone if no reactive prop changed, so
    // we manually rebuild + render after the next paint.
    requestAnimationFrame(() => {
      this.ensureMap();
      const trip = this.currentTrip;
      if (this.tripMap && trip) {
        this.tripMap.render(this.resolveTrip(trip));
        this.maybeLoadRoute(trip);
      }
    });
  }

  // ─── Pagination ────────────────────────────────────────────────────────

  private get currentTrip(): Trip | undefined {
    return this.trips[this.index];
  }

  private prev = (ev?: Event): void => {
    ev?.stopPropagation();
    const wrap = this.config?.pagination?.wrap ?? false;
    if (this.index > 0) {
      this.index -= 1;
    } else if (wrap) {
      this.index = this.trips.length - 1;
    }
  };

  private next = (ev?: Event): void => {
    ev?.stopPropagation();
    const wrap = this.config?.pagination?.wrap ?? false;
    if (this.index < this.trips.length - 1) {
      this.index += 1;
    } else if (wrap) {
      this.index = 0;
    }
  };

  /** Block pointer events on the pager from reaching action-handler.
   *  Without this, tapping `‹` / `›` would also fire the card's tap_action
   *  (more-info / navigate / etc.) — surprising and annoying. */
  private swallowPointer = (ev: Event): void => {
    ev.stopPropagation();
  };

  private handleKey = (ev: KeyboardEvent): void => {
    if (ev.key === "ArrowLeft") this.prev();
    if (ev.key === "ArrowRight") this.next();
  };

  // ─── Actions (tap / hold / double-tap) ─────────────────────────────────

  /** Forward the resolved interaction up the tree as a `hass-action` event.
   *  HA's standard handler picks it up and routes to more-info / toggle /
   *  call-service / navigate / url / etc., honouring confirmations and
   *  haptics — we don't reimplement that machinery here. Default actions
   *  follow the HA convention: tap → more-info, hold/double-tap → none.
   *  See https://developers.home-assistant.io/blog/2023/07/07/action-event-custom-cards/ */
  private handleAction = (ev: CustomEvent<{ action?: string }>): void => {
    if (!this.hass || !this.config || !ev.detail?.action) return;
    const action = ev.detail.action;
    const cfg = this.config;
    // Use a synthetic config so `tap_action` defaults to more-info on the
    // first configured source's entity (when one is set), giving a sane
    // out-of-the-box click behaviour without any user config.
    const fallbackEntity = cfg.sources?.[0]?.entity;
    const synthetic = {
      ...cfg,
      entity: fallbackEntity,
      tap_action:
        cfg.tap_action ??
        ({ action: "more-info" } as ActionConfig),
      hold_action: cfg.hold_action ?? ({ action: "none" } as ActionConfig),
      double_tap_action:
        cfg.double_tap_action ?? ({ action: "none" } as ActionConfig),
    };
    const event = new Event("hass-action", { bubbles: true, composed: true });
    (event as Event & { detail?: unknown }).detail = {
      config: synthetic,
      action,
    };
    this.dispatchEvent(event);
  };

  /** True if any action is configured (or tap defaults to more-info because
   *  we have an entity to open). Used to decide whether to wire actionHandler. */
  private hasAnyAction(): boolean {
    const cfg = this.config;
    if (!cfg) return false;
    if (
      hasAction(cfg.tap_action) ||
      hasAction(cfg.hold_action) ||
      hasAction(cfg.double_tap_action)
    ) {
      return true;
    }
    // Default tap → more-info only if there's an entity to open.
    return !!cfg.sources?.[0]?.entity;
  }

  // ─── Render ────────────────────────────────────────────────────────────

  protected override render() {
    if (!this.trips.length) return this.renderEmpty();
    const trip = this.currentTrip!;
    const cfg = this.config;
    const actionable = this.hasAnyAction();
    // actionHandler binds pointer events on the ha-card. We only attach
    // when an action is actually configured (or defaultable), to keep the
    // card non-interactive when the user hasn't opted in.
    return html`<ha-card
      class=${actionable ? "tv-actionable" : ""}
      .actionHandler=${actionable
        ? actionHandler({
            hasHold: hasAction(cfg?.hold_action),
            hasDoubleClick: hasAction(cfg?.double_tap_action),
          })
        : undefined}
      @action=${actionable ? this.handleAction : undefined}
    >
      ${this.config?.title
        ? html`<div class="tv-title">${this.config.title}</div>`
        : nothing}
      <div class="tv-header">
        <div class="tv-label">${renderLabel(this.config?.label?.template ?? DEFAULT_LABEL_TPL, trip)}</div>
        ${this.renderPager()}
      </div>
      <div
        class="tv-map-wrap"
        style=${`height: ${this.config?.map?.height ?? 280}px;`}
      >
        <div class="tv-map"></div>
        ${this.renderLegend()}
      </div>
      ${this.renderStats(trip)}
    </ha-card>`;
  }

  /** Tiny corner overlay explaining polyline colour semantics.
   *  Each dot's `background` is emitted as a CSS expression that itself
   *  resolves the precedence chain at paint time (yamlVal | var(...) |
   *  fallback). This means the legend stays in sync with the actual
   *  polyline even when a CSS custom property changes at runtime — no Lit
   *  re-render needed. */
  private renderLegend() {
    const cfg = this.config?.map?.polyline;
    const colorBy = cfg?.color_by ?? "solid";
    if (colorBy === "solid") return nothing;
    const yamlPal = cfg?.palette ?? {};
    const css = (key: string, fallback: string): string => {
      const yaml = yamlPal[key];
      // YAML wins explicitly, otherwise fall through to the var() with the
      // hardcoded default as last-resort fallback.
      if (yaml) return yaml;
      return `var(--journey-viewer-polyline-${key}, ${fallback})`;
    };
    const items: Array<{ color: string; label: string }> = [];
    if (colorBy === "ev") {
      items.push({ color: css("ev", "#1d8cf8"), label: "EV" });
      items.push({ color: css("ice", "#f6a800"), label: "ICE" });
    } else if (colorBy === "overspeed") {
      items.push({ color: css("overspeed", "#e63946"), label: "Overspeed" });
      items.push({ color: css("solid", "#e63946"), label: "Normal" });
    } else if (colorBy === "highway") {
      items.push({ color: css("highway", "#7b2cbf"), label: "Highway" });
      items.push({ color: css("solid", "#e63946"), label: "City" });
    }
    if (!items.length) return nothing;
    return html`<div class="tv-legend">
      ${items.map(
        (it) => html`<div class="tv-legend-item">
          <span class="tv-legend-dot" style=${`background: ${it.color};`}></span>
          <span>${it.label}</span>
        </div>`,
      )}
    </div>`;
  }

  private renderEmpty() {
    const e = this.config?.empty_state ?? {};
    return html`<ha-card>
      <div class="tv-empty">
        ${e.icon ? html`<ha-icon icon=${e.icon}></ha-icon>` : nothing}
        <div class="tv-empty-title">${e.title ?? "No trips"}</div>
        <div class="tv-empty-body">${e.body ?? "No trip data available."}</div>
      </div>
    </ha-card>`;
  }

  private renderPager() {
    if (!this.trips.length) return nothing;
    const cfg = this.config?.pagination ?? {};
    const counter = cfg.show_counter !== false;
    const wrap = cfg.wrap ?? false;
    const atFirst = !wrap && this.index === 0;
    const atLast = !wrap && this.index === this.trips.length - 1;
    return html`<div
      class="tv-pager"
      @pointerdown=${this.swallowPointer}
      @click=${this.swallowPointer}
    >
      <button
        class="tv-btn"
        ?disabled=${atFirst}
        @click=${this.prev}
        aria-label="Previous trip"
        title="Previous trip"
      >
        ‹
      </button>
      ${counter
        ? html`<span class="tv-counter" aria-label="Trip ${this.index + 1} of ${this.trips.length}">${this.index + 1} / ${this.trips.length}</span>`
        : nothing}
      <button
        class="tv-btn"
        ?disabled=${atLast}
        @click=${this.next}
        aria-label="Next trip"
        title="Next trip"
      >
        ›
      </button>
    </div>`;
  }

  private renderStats(trip: Trip) {
    const grid = this.config?.stats_grid;
    if (!grid?.rows?.length) return nothing;
    const cols = grid.columns_default ?? STATS_GRID_DEFAULT_COLS;
    const colsMobile = grid.columns_mobile ?? 2;
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const bgAlpha = grid.tile_bg_alpha != null ? clamp01(grid.tile_bg_alpha) : 1;
    const styleParts = [
      `--tv-cols: ${cols}`,
      `--tv-cols-mobile: ${colsMobile}`,
      `--jv-tile-bg-alpha: ${bgAlpha}`,
    ];
    if (grid.tile_bg_color) {
      styleParts.push(`--jv-tile-bg-color: ${grid.tile_bg_color}`);
    }
    // Trend decorator needs the previous trip - in newest_first order that's
    // the trip at index+1. (oldest_first → trips[index-1].)
    const order = this.config?.order ?? "newest_first";
    const prevIdx = order === "newest_first" ? this.index + 1 : this.index - 1;
    const prevTrip = this.trips[prevIdx];

    // (Re-)build the per-trip cache when the (trip, prevTrip) pair changes.
    if (
      !this.rowCache ||
      this.rowCache.trip !== trip ||
      this.rowCache.prevTrip !== prevTrip
    ) {
      this.rowCache = { trip, prevTrip, rows: new WeakMap() };
    }

    return html`<div class="tv-stats" style=${styleParts.join("; ")}>
      ${grid.rows.map((row) => this.renderStatTile(row, trip, prevTrip))}
    </div>`;
  }

  /** Compute the resolved numeric value for a row, honoring `ratio_of`.
   *  Returns the value to display (used by formatStat) and the number to
   *  feed the threshold/bar/trend computations. They diverge only when
   *  ratio_of is set + the denominator is missing → both null. */
  private computeRowValue(
    row: StatsRow,
    trip: Trip,
  ): { display: unknown; numeric: number | null } {
    let display: unknown = row.key ? getByPath(trip, row.key) : undefined;
    let numeric =
      typeof display === "number" ? display : display == null ? null : Number(display);
    if (row.ratio_of && numeric != null && Number.isFinite(numeric)) {
      const denomRaw = getByPath(trip, row.ratio_of);
      const denom = typeof denomRaw === "number" ? denomRaw : Number(denomRaw);
      if (Number.isFinite(denom) && denom !== 0) {
        numeric = numeric / denom;
        display = numeric;
      } else {
        numeric = null;
        display = null;
      }
    }
    return { display, numeric };
  }

  /** Resolve the bar background gradient layer for a row. Returns undefined
   *  when no bar is configured or the value is missing/non-finite. */
  private computeBarLayer(
    row: StatsRow,
    trip: Trip,
    numeric: number | null,
    decorationColor: string | undefined,
  ): string | undefined {
    const bar = row.bar;
    if (!bar || numeric == null || !Number.isFinite(numeric)) return undefined;
    const max = resolveMax(bar.max, trip);
    if (max == null) return undefined;
    const pct = barPct(numeric, max);
    const explicit = bar.color && bar.color !== "auto" ? bar.color : null;
    const barColor =
      explicit ??
      decorationColor ??
      // Fall back to primary if `auto` was set but no thresholds resolved.
      "var(--primary-color, #03a9f4)";
    const track = bar.track ?? "transparent";
    // Multi-layer background: bar gradient on top, tile bg below (the
    // existing color-mix on .tv-tile via --jv-tile-bg-color/alpha).
    return `linear-gradient(to right, ${barColor} ${pct}%, ${track} ${pct}%)`;
  }

  /** Compute trend info for a row, including ratio_of-aware previous value. */
  private computeRowTrend(
    row: StatsRow,
    prevTrip: Trip | undefined,
    numeric: number | null,
  ): TrendInfo | undefined {
    if (!row.trend || !prevTrip || !row.key) return undefined;
    const prevValue = getByPath(prevTrip, row.key);
    let prevNumeric: number | null =
      typeof prevValue === "number"
        ? prevValue
        : prevValue == null
          ? null
          : Number(prevValue);
    if (row.ratio_of && prevNumeric != null && Number.isFinite(prevNumeric)) {
      const denomRaw = getByPath(prevTrip, row.ratio_of);
      const denom = typeof denomRaw === "number" ? denomRaw : Number(denomRaw);
      prevNumeric =
        Number.isFinite(denom) && denom !== 0 ? prevNumeric / denom : null;
    }
    return computeTrend(numeric, prevNumeric, row.trend.invert ?? false);
  }

  /** Build (or reuse) the cached set of computed decorations for one row. */
  private getRowComputed(
    row: StatsRow,
    trip: Trip,
    prevTrip: Trip | undefined,
  ): RowComputed {
    const cache = this.rowCache!;
    const cached = cache.rows.get(row);
    if (cached) return cached;

    const { display, numeric } = this.computeRowValue(row, trip);
    const formatted = formatStat(display, row.format, row.decimals);

    const matched = matchThreshold(numeric, row.thresholds);
    const decorationColor =
      (row.color_mode ?? "solid") === "gradient"
        ? gradientColor(numeric, row.thresholds)
        : matched?.color;
    const colorTarget = row.color_target ?? "value";
    const effectiveIcon = matched?.icon ?? row.icon;
    const barUsesAuto = !!row.bar && (!row.bar.color || row.bar.color === "auto");
    const barBgLayer = this.computeBarLayer(row, trip, numeric, decorationColor);
    const trendInfo = this.computeRowTrend(row, prevTrip, numeric);

    const computed: RowComputed = {
      formatted,
      decorationColor,
      effectiveIcon,
      colorTarget,
      barBgLayer,
      barUsesAuto,
      trendInfo,
    };
    cache.rows.set(row, computed);
    return computed;
  }

  private renderStatTile(row: StatsRow, trip: Trip, prevTrip: Trip | undefined) {
    const c = this.getRowComputed(row, trip, prevTrip);

    // When the bar IS using the threshold color (bar.color: auto), the bar
    // already carries the colour signal. Applying color_target as well would
    // double-up the same colour and tank value-text readability. Skip the
    // redundant decoration in that case. User who wants both can set
    // bar.color to an explicit colour distinct from the thresholds.
    const colorOnTextOrTile = c.barUsesAuto ? undefined : c.decorationColor;

    const tileStyles: string[] = [];
    const tileClasses: string[] = ["tv-tile"];
    if (colorOnTextOrTile) {
      if (c.colorTarget === "value") {
        tileStyles.push(`--jv-row-color: ${colorOnTextOrTile}`);
      } else {
        tileStyles.push(`--jv-tile-bg-color: ${colorOnTextOrTile}`);
      }
    }
    if (c.barBgLayer) {
      tileStyles.push(`--jv-bar-layer: ${c.barBgLayer}`);
      tileClasses.push("has-bar");
    }
    if (c.colorTarget === "value" && colorOnTextOrTile)
      tileClasses.push("colored-value");

    return html`<div
      class=${tileClasses.join(" ")}
      style=${tileStyles.join("; ")}
    >
      <div class="tv-tile-label">
        ${c.effectiveIcon
          ? row.trend?.position === "replace_icon" && c.trendInfo
            ? this.renderTrendIcon(c.trendInfo, row.trend.show_delta ?? false)
            : html`<ha-icon icon=${c.effectiveIcon}></ha-icon>`
          : nothing}
        ${row.label}
      </div>
      <div class="tv-tile-value">
        ${c.trendInfo && row.trend?.position === "before_value"
          ? this.renderTrend(c.trendInfo, row.trend.show_delta ?? false, row)
          : nothing}
        ${c.formatted}
        ${c.trendInfo &&
        (row.trend?.position === "after_value" || row.trend?.position == null)
          ? this.renderTrend(c.trendInfo, row.trend?.show_delta ?? false, row)
          : nothing}
      </div>
    </div>`;
  }

  private renderTrend(info: TrendInfo, showDelta: boolean, row: StatsRow) {
    const arrow = info.direction === "up" ? "↑" : info.direction === "down" ? "↓" : "→";
    const cls = `tv-trend tv-trend-${info.sentiment}`;
    // Delta format precedence (most → least specific):
    //   1. trend.format if user set it explicitly
    //   2. row.format IF it's a unit-converter preset ("km", "L", "duration")
    //      — units must transfer to the delta or the number is meaningless
    //   3. plain numeric with smart decimals (integer → 0, float → 2)
    // Templates like "{v} / 100" are NOT inherited because the "/ 100"
    // suffix would misread on a delta. Users with max-suffix templates set
    // trend.format explicitly (usually `~` or "{v}").
    const explicit = row.trend?.format;
    const inheritsRowFormat = ["km", "L", "duration"].includes(row.format ?? "");
    const fmt = explicit ?? (inheritsRowFormat ? row.format : undefined);
    const smartDecimals =
      row.decimals ?? (Number.isInteger(info.delta) ? 0 : 2);
    const delta =
      showDelta && info.direction !== "flat"
        ? ` ${formatStat(Math.abs(info.delta), fmt, smartDecimals)}`
        : "";
    return html`<span class=${cls}>${arrow}${delta}</span>`;
  }

  private renderTrendIcon(info: TrendInfo, _showDelta: boolean) {
    const icon =
      info.direction === "up"
        ? "mdi:trending-up"
        : info.direction === "down"
          ? "mdi:trending-down"
          : "mdi:trending-neutral";
    const cls = `tv-trend tv-trend-${info.sentiment}`;
    return html`<ha-icon class=${cls} icon=${icon}></ha-icon>`;
  }

  static override styles = css`
    ${unsafeCSS(leafletCss)}

    /*
     * Theme tokens. Every value below cascades from HA theme variables when
     * present, otherwise sensible fallbacks. Users can override any of them
     * via:
     *   - theme YAML:  journey-viewer-polyline-ev: "#ff00aa"
     *   - card_mod:    :host { --journey-viewer-polyline-ev: hotpink; }
     *   - per-card YAML: map.polyline.palette.ev: "#ff00aa"  (highest precedence)
     */
    :host {
      --jv-radius: var(--ha-card-border-radius, 12px);
      --jv-radius-sm: 6px;
      --jv-tile-bg: var(--secondary-background-color, #f3f4f6);
      --jv-legend-bg: var(--card-background-color, rgba(255, 255, 255, 0.92));
      --jv-leaflet-control-bg: var(--card-background-color, #fff);
      --jv-leaflet-control-fg: var(--primary-text-color, #333);
    }

    ha-card {
      padding: 12px 12px 8px;
      box-sizing: border-box;
    }
    /* When tap/hold/double-tap actions are configured, hint affordance.
       Cursor only appears outside the map (Leaflet sets its own cursors)
       and outside pager buttons (their own .tv-btn cursor wins). */
    ha-card.tv-actionable {
      cursor: pointer;
    }

    /* Make Leaflet's zoom buttons + attribution legible against any theme.
       Leaflet ships its own white-background controls; without an override
       they look stark against HA dark themes. */
    .leaflet-bar a,
    .leaflet-bar a:hover {
      background-color: var(--jv-leaflet-control-bg);
      color: var(--jv-leaflet-control-fg);
      border-bottom-color: var(--divider-color, #ddd);
    }
    .leaflet-bar a:hover {
      background-color: var(--secondary-background-color, #eee);
    }
    /* Always-on minimal attribution. OSM and CARTO usage policies require
       attribution; styling makes it small and low-contrast so it doesn't fight
       the data. Hovers up to full opacity for users who want to click through. */
    .leaflet-control-attribution {
      background: var(--jv-legend-bg) !important;
      color: var(--secondary-text-color, #666) !important;
      font-size: 8px !important;
      padding: 0 4px !important;
      line-height: 14px !important;
      opacity: 0.4;
      transition: opacity 150ms ease;
    }
    .leaflet-control-attribution:hover {
      opacity: 0.9;
    }
    .leaflet-control-attribution a {
      color: var(--primary-color, #03a9f4) !important;
    }
    .tv-title {
      font-weight: 500;
      font-size: 16px;
      margin-bottom: 8px;
    }
    .tv-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .tv-label {
      flex: 1;
      font-weight: 500;
      font-size: 14px;
      color: var(--primary-text-color);
    }
    .tv-pager {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tv-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid var(--primary-color, #03a9f4);
      background: transparent;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 0;
      transition:
        background 120ms ease,
        opacity 120ms ease;
    }
    /* Hover, mousedown, and keyboard focus all share the filled-accent look.
       Without explicit :active and :focus-visible rules the browser falls
       back to its default light-grey button styling, which is near-identical
       to our [disabled] state and makes a freshly-clicked button look like
       it just got greyed out. */
    .tv-btn:hover:not([disabled]),
    .tv-btn:active:not([disabled]),
    .tv-btn:focus-visible:not([disabled]) {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      outline: none;
    }
    /* Suppress the default focus ring when focus came from a click (mouse).
       :focus-visible above keeps the ring for keyboard users who need it. */
    .tv-btn:focus:not(:focus-visible) {
      outline: none;
    }
    .tv-btn[disabled] {
      opacity: 0.3;
      cursor: default;
      border-color: var(--disabled-text-color, #999);
      color: var(--disabled-text-color, #999);
    }
    .tv-counter {
      font-size: 12px;
      color: var(--secondary-text-color);
      min-width: 36px;
      text-align: center;
    }
    .tv-map-wrap {
      width: 100%;
      border-radius: var(--jv-radius);
      overflow: hidden;
      background: var(--jv-tile-bg);
      /* Confine Leaflet z-index stack to this card. Without isolation, Leaflet
         .leaflet-top/.leaflet-bottom controls (z-index 1000) escape upward and
         overlap HA's side drawer + mobile-app nav. Establishing a new stacking
         context here clamps all Leaflet z-indexes to within. */
      isolation: isolate;
      position: relative;
      z-index: 0;
    }
    .tv-map {
      width: 100%;
      height: 100%;
    }
    .tv-legend {
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--jv-legend-bg);
      border-radius: var(--jv-radius-sm);
      padding: 4px 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      display: flex;
      gap: 10px;
      font-size: 11px;
      pointer-events: none;
      z-index: 400;
    }
    .tv-legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--primary-text-color);
    }
    .tv-legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .tv-stats {
      display: grid;
      grid-template-columns: repeat(var(--tv-cols, 4), 1fr);
      gap: 8px;
      margin-top: 8px;
    }
    @media (max-width: 600px) {
      .tv-stats {
        grid-template-columns: repeat(var(--tv-cols-mobile, 2), 1fr);
      }
    }
    .tv-tile {
      /* Background composes two layers when a bar is present:
         1. Bar gradient overlay (top layer, opaque colored fill on left,
            track on right; supplied via --jv-bar-layer).
         2. Tile base color via color-mix (theme bg or per-row override,
            with alpha multiplier).
         When .has-bar is absent, --jv-bar-layer falls back to a transparent
         layer so the tile base shines through. */
      background:
        var(--jv-bar-layer, linear-gradient(transparent, transparent)),
        color-mix(
          in srgb,
          var(--jv-tile-bg-color, var(--jv-tile-bg))
            calc(var(--jv-tile-bg-alpha, 1) * 100%),
          transparent
        );
      border-radius: var(--jv-radius);
      padding: 8px 10px;
    }
    /* When color_target=value, the matched threshold colour rides on
       --jv-row-color which only the value text reads. Default fall-through
       is the tile's own primary text colour (no decoration). */
    .tv-tile.colored-value .tv-tile-value {
      color: var(--jv-row-color);
    }
    /* Trend arrow colours by sentiment. */
    .tv-trend {
      font-weight: 500;
      margin: 0 4px;
      font-size: 13px;
    }
    .tv-trend-good {
      color: var(--success-color, #2a9d8f);
    }
    .tv-trend-bad {
      color: var(--error-color, #e63946);
    }
    .tv-trend-neutral {
      color: var(--secondary-text-color, #888);
    }
    ha-icon.tv-trend {
      --mdc-icon-size: 18px;
    }
    .tv-tile-label {
      font-size: 11px;
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .tv-tile-label ha-icon {
      --mdc-icon-size: 14px;
    }
    .tv-tile-value {
      font-size: 16px;
      font-weight: 500;
      margin-top: 2px;
    }
    .tv-empty {
      padding: 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .tv-empty ha-icon {
      --mdc-icon-size: 48px;
      margin-bottom: 8px;
    }
    .tv-empty-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 4px;
    }
  `;
}

// Self-register for Lovelace card picker. Guard against the bundle being
// re-evaluated (HACS hot-reload, manual reload via the resources page,
// import() from another script) by checking the registry before defining.
// We deliberately AVOID the `@customElement` decorator on JourneyViewerCard
// because it throws synchronously on duplicate registration; manual
// `customElements.define` lets us guard idempotently.
declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
    }>;
  }
}
if (!customElements.get("journey-viewer-card")) {
  customElements.define("journey-viewer-card", JourneyViewerCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "journey-viewer-card",
    name: "Journey Viewer",
    description:
      "Paginated GPS journey viewer. Drive, ride, run, hike. Toyota, Strava, Garmin, Komoot, generic.",
    preview: true,
  });
  // HACS convention: emit a styled banner on first load so users can confirm
  // version + presence in DevTools console without poking around.
  // eslint-disable-next-line no-console
  console.info(
    `%c JOURNEY-VIEWER-CARD %c v${CARD_VERSION} `,
    "color: white; background: #1d8cf8; font-weight: 700;",
    "color: #1d8cf8; background: white; font-weight: 700;",
  );
}
