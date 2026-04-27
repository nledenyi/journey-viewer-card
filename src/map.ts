/** Leaflet map wrapper: render one trip's polyline + start/end + behaviour markers. */

import L from "leaflet";
import type { MapConfig, RoutePoint, Trip } from "./types.js";

/** Always-on minimal attribution (per OSM / CARTO usage policy). Styled tiny
 * and low-contrast in card.ts; fades up on hover for users who want to click
 * through to the source. */
const TILE_PROVIDERS: Record<
  string,
  { url: string; attributionShort: string }
> = {
  openstreetmap: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attributionShort:
      '© <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
  "carto-positron": {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    attributionShort:
      '© <a href="https://www.openstreetmap.org/copyright">OSM</a>, © <a href="https://carto.com/attributions">CARTO</a>',
  },
  "carto-dark-matter": {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    attributionShort:
      '© <a href="https://www.openstreetmap.org/copyright">OSM</a>, © <a href="https://carto.com/attributions">CARTO</a>',
  },
};

/** Hardcoded fallback palette used when neither the YAML config nor the theme
 * supplies a color. Picked to be readable on both light and dark base maps. */
const DEFAULT_PALETTE: Record<string, string> = {
  ev: "#1d8cf8",
  ice: "#f6a800",
  overspeed: "#e63946",
  highway: "#7b2cbf",
  solid: "#e63946",
};

/** Per-key CSS custom property to read off the host element. Lets a theme or
 * card-mod override the palette without touching the YAML config. */
const PALETTE_CSS_VAR: Record<string, string> = {
  ev: "--journey-viewer-polyline-ev",
  ice: "--journey-viewer-polyline-ice",
  overspeed: "--journey-viewer-polyline-overspeed",
  highway: "--journey-viewer-polyline-highway",
  solid: "--journey-viewer-polyline-solid",
};

/** Resolve the effective polyline palette from (in priority order):
 *  1. YAML config (`map.polyline.palette.<key>`) — highest
 *  2. CSS custom property on the host (e.g. --journey-viewer-polyline-ev)
 *  3. Hardcoded default
 */
function resolvePalette(
  host: HTMLElement,
  yamlPalette: Record<string, string> | undefined,
): Record<string, string> {
  const computed = getComputedStyle(host);
  const out: Record<string, string> = {};
  for (const key of Object.keys(DEFAULT_PALETTE)) {
    const yamlVal = yamlPalette?.[key];
    if (yamlVal) {
      out[key] = yamlVal;
      continue;
    }
    const cssVar = PALETTE_CSS_VAR[key];
    if (cssVar) {
      const cssVal = computed.getPropertyValue(cssVar).trim();
      if (cssVal) {
        out[key] = cssVal;
        continue;
      }
    }
    out[key] = DEFAULT_PALETTE[key]!;
  }
  return out;
}

export class TripMap {
  private map?: L.Map;
  private layer?: L.LayerGroup;
  private pendingTrip?: Trip;
  private resizeObserver?: ResizeObserver;
  /** Last trip the caller asked us to render. Held so ResizeObserver can
   *  replay the render when the container transitions from zero-size back
   *  to laid-out (e.g. after a Lovelace edit-mode exit). Without this,
   *  invalidateSize() alone leaves stale pane geometry — polyline draws
   *  at the previous size's pixel coordinates and looks blank. */
  private lastTrip?: Trip;
  private lastSize = { w: 0, h: 0 };

  constructor(private container: HTMLElement, private cfg: MapConfig) {}

  /**
   * Init Leaflet once the container has real dimensions.
   *
   * The zero-size container trap: when Lit first renders us into the DOM,
   * the .tv-map div is laid out asynchronously. If we call L.map(container)
   * during that window, Leaflet captures size 0×0 and bakes that into its
   * pixel arithmetic — every later fitBounds works off that stale viewport.
   * Symptoms: tiles render, polyline doesn't, bounds calculation is wrong.
   *
   * Fix: defer init until the container has a non-zero box, then attach a
   * ResizeObserver so subsequent resizes call invalidateSize() too.
   */
  private ensure(): L.Map | undefined {
    if (this.map) return this.map;
    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return undefined;

    const provider =
      TILE_PROVIDERS[this.cfg.tile_provider ?? "openstreetmap"] ??
      TILE_PROVIDERS.openstreetmap;

    // gestures: "locked" (default) → all interaction off. Page scroll passes
    // through cleanly on mobile. The +/- zoom buttons remain functional —
    // they're a separate UI element bound to map.zoomIn/Out, not gesture-
    // captured. Locked mode is the right default for an embedded dashboard
    // card; users wanting to explore the map should switch to "enabled".
    const locked = this.cfg.gestures === "locked";
    const m = L.map(this.container, {
      zoomControl: true,
      // Attribution stays on per OSM / CARTO usage-policy requirements. Style
      // makes it tiny + low-contrast (see card.ts .leaflet-control-attribution
      // rules). Hover fades it up to 0.9 opacity.
      attributionControl: true,
      scrollWheelZoom: !locked,
      dragging: !locked,
      touchZoom: !locked,
      doubleClickZoom: !locked,
      boxZoom: !locked,
      keyboard: !locked,
    });
    // Drop Leaflet's "Leaflet" marketing prefix — keep just the OSM/CARTO link.
    m.attributionControl.setPrefix(false);

    L.tileLayer(provider.url, {
      attribution: provider.attributionShort,
      maxZoom: 19,
    }).addTo(m);
    this.map = m;

    // Watch for later size changes (theme switch, dashboard resize, mobile
    // rotate, Lovelace edit-mode toggle). Two reactions:
    //   - any non-zero resize → invalidateSize() so panes catch up
    //   - meaningful resize (>1px diff) AND we have a prior trip → full
    //     render(lastTrip) so the polyline reprojects against the new size.
    //     Without this second leg, the polyline stays at its previous pixel
    //     positions and the map looks blank after edit-mode exit.
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) {
        // Container hidden (edit mode, drawer collapse, off-screen). Reset
        // our size tracking so the next non-zero observation is treated as
        // a meaningful resize.
        this.lastSize = { w: 0, h: 0 };
        return;
      }
      m.invalidateSize();
      const sizeChanged =
        Math.abs(width - this.lastSize.w) > 1 ||
        Math.abs(height - this.lastSize.h) > 1;
      this.lastSize = { w: width, h: height };
      if (sizeChanged && this.lastTrip) {
        // Defer one frame so Leaflet's invalidateSize commit fully applies
        // before we re-fit. Calling render() inside render() is safe — it
        // doesn't mutate container size, so won't loop the observer.
        requestAnimationFrame(() => {
          if (this.lastTrip) this.render(this.lastTrip);
        });
      }
    });
    this.resizeObserver.observe(this.container);

    // Defensive: even though the container had non-zero rect when we read it,
    // Leaflet's internal _size may not match by the time the first paint
    // happens. Schedule an invalidateSize after the next layout pass AND a
    // microtask later. Cheap, idempotent, and reliably fixes the "panes are
    // 0×0 even though the container is sized" symptom inside shadow DOM /
    // grid-layout containers.
    setTimeout(() => m.invalidateSize(), 0);
    requestAnimationFrame(() => m.invalidateSize());
    return m;
  }

  /** Replace all trip-specific layers with this trip's data. */
  render(trip: Trip): void {
    // Remember regardless of whether ensure() succeeds — if the container is
    // currently zero-sized, the ResizeObserver will replay this trip once
    // the container is laid out again (Lovelace edit-mode exit).
    this.lastTrip = trip;
    let m = this.ensure();
    if (!m) {
      // Container not laid out yet — queue and retry on next animation frame.
      this.pendingTrip = trip;
      requestAnimationFrame(() => {
        if (this.pendingTrip) {
          const trip2 = this.pendingTrip;
          this.pendingTrip = undefined;
          this.render(trip2);
        }
      });
      return;
    }

    if (this.layer) this.layer.remove();
    this.layer = L.layerGroup().addTo(m);

    if (!trip.route.length) {
      this.dropEndpoints(trip);
      this.fitAndSettle(m, this.collectCoords(trip));
      return;
    }

    this.drawPolyline(trip);
    this.dropEndpoints(trip);
    this.dropBehaviours(trip);
    this.fitAndSettle(m, this.collectCoords(trip));
  }

  /**
   * Fit + invalidateSize at multiple staggered checkpoints.
   *
   * In a Lit shadow DOM with HA's grid sections layout, Leaflet's internal
   * size cache can lag the actual container size. We hit invalidateSize at
   * three checkpoints: now (best-effort), next macrotask (post-layout), next
   * frame (post-paint). Each is idempotent + cheap, and at least one will
   * land at the right time across the timing variations we've observed.
   */
  private fitAndSettle(m: L.Map, coords: Array<[number, number]>): void {
    m.invalidateSize();
    this.fitToBounds(m, coords);
    setTimeout(() => {
      m.invalidateSize();
      this.fitToBounds(m, coords);
    }, 0);
    requestAnimationFrame(() => {
      m.invalidateSize();
      this.fitToBounds(m, coords);
    });
  }

  // ─── Polyline ─────────────────────────────────────────────────────────────

  private drawPolyline(trip: Trip): void {
    const cfg = this.cfg.polyline ?? {};
    const colorBy = cfg.color_by ?? "solid";
    const palette = resolvePalette(this.container, cfg.palette);
    const weight = cfg.weight ?? 4;
    const opacity = cfg.opacity ?? 0.9;

    if (colorBy === "solid") {
      const path = trip.route.map((p) => [p.lat, p.lon] as [number, number]);
      L.polyline(path, { color: palette.solid, weight, opacity }).addTo(this.layer!);
      return;
    }

    // Multi-colour: split route into runs of same colour.
    const segments = splitByColor(trip.route, colorBy, palette);
    for (const seg of segments) {
      L.polyline(seg.coords, { color: seg.color, weight, opacity }).addTo(this.layer!);
    }
  }

  // ─── Endpoint pins ────────────────────────────────────────────────────────

  private dropEndpoints(trip: Trip): void {
    const m = this.cfg.markers ?? {};
    const startC = m.start?.color ?? "#2a9d8f";
    const endC = m.end?.color ?? "#e63946";

    if (validCoord(trip.start)) {
      L.circleMarker([trip.start.lat, trip.start.lon], {
        radius: 8,
        color: "#fff",
        weight: 2,
        fillColor: startC,
        fillOpacity: 1,
      })
        .bindTooltip("Start")
        .addTo(this.layer!);
    }
    if (validCoord(trip.end)) {
      L.circleMarker([trip.end.lat, trip.end.lon], {
        radius: 8,
        color: "#fff",
        weight: 2,
        fillColor: endC,
        fillOpacity: 1,
      })
        .bindTooltip("End")
        .addTo(this.layer!);
    }
  }

  // ─── Behaviour markers ────────────────────────────────────────────────────

  private dropBehaviours(trip: Trip): void {
    const cfg = this.cfg.markers?.behaviours;
    if (!cfg?.enabled || !trip.behaviours?.length) return;
    const goodStyle = cfg.style?.good ?? { color: "#2a9d8f", radius: 6 };
    const badStyle = cfg.style?.bad ?? { color: "#e63946", radius: 8 };
    const tipTpl = cfg.tooltip ?? "{type} severity={severity}";

    for (const b of trip.behaviours) {
      if (!validCoord(b)) continue;
      const style = b.good ? goodStyle : badStyle;
      L.circleMarker([b.lat, b.lon], {
        radius: style.radius ?? 5,
        color: "#fff",
        weight: 1,
        fillColor: style.color ?? "#000",
        fillOpacity: 0.9,
      })
        .bindTooltip(
          tipTpl
            .replace("{type}", String(b.type ?? "?"))
            .replace("{severity}", String(b.severity ?? "?"))
            .replace("{ts}", String(b.ts ?? "")),
        )
        .addTo(this.layer!);
    }
  }

  // ─── Bounds ───────────────────────────────────────────────────────────────

  private collectCoords(trip: Trip): Array<[number, number]> {
    const all: Array<[number, number]> = trip.route.map((p) => [p.lat, p.lon]);
    if (validCoord(trip.start)) all.push([trip.start.lat, trip.start.lon]);
    if (validCoord(trip.end)) all.push([trip.end.lat, trip.end.lon]);
    return all;
  }

  private fitToBounds(m: L.Map, coords: Array<[number, number]>): void {
    if (!coords.length) {
      m.setView([0, 0], 2);
      return;
    }
    if (!this.cfg.zoom_to_fit && coords.length > 0) {
      m.setView(coords[0]!, 14);
      return;
    }
    const pad = Math.round((this.cfg.padding_pct ?? 10));
    const bounds = L.latLngBounds(coords);
    m.fitBounds(bounds, { padding: [pad, pad], maxZoom: 17 });
  }

  /** Re-layout after container resize (e.g. dashboard resize). */
  invalidateSize(): void {
    this.map?.invalidateSize();
  }

  destroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.map?.remove();
    this.map = undefined;
    this.layer = undefined;
    this.pendingTrip = undefined;
    this.lastTrip = undefined;
    this.lastSize = { w: 0, h: 0 };
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function validCoord(c: { lat?: number | null; lon?: number | null } | undefined): c is {
  lat: number;
  lon: number;
} {
  return !!c && typeof c.lat === "number" && typeof c.lon === "number";
}

interface ColoredSegment {
  coords: Array<[number, number]>;
  color: string;
}

function splitByColor(
  route: RoutePoint[],
  colorBy: "ev" | "overspeed" | "highway" | "mode",
  palette: Record<string, string>,
): ColoredSegment[] {
  const out: ColoredSegment[] = [];
  let current: ColoredSegment | undefined;

  const colorFor = (p: RoutePoint): string => {
    if (colorBy === "ev") return p.isEv ? palette.ev! : palette.ice!;
    if (colorBy === "overspeed") return p.overspeed ? palette.overspeed! : palette.solid!;
    if (colorBy === "highway") return p.highway ? palette.highway! : palette.solid!;
    if (colorBy === "mode") {
      // Map small mode ints to palette keys mode_0, mode_1, ...
      const k = `mode_${p.mode ?? 0}`;
      return palette[k] ?? palette.solid!;
    }
    return palette.solid!;
  };

  for (const p of route) {
    const c = colorFor(p);
    if (!current || current.color !== c) {
      // Bridge: include the last point of the previous segment so the segments
      // visually connect without gaps where the colour flips.
      if (current && current.coords.length) {
        out.push(current);
        current = { color: c, coords: [current.coords[current.coords.length - 1]!] };
      } else {
        current = { color: c, coords: [] };
      }
    }
    current.coords.push([p.lat, p.lon]);
  }
  if (current && current.coords.length) out.push(current);
  return out;
}
