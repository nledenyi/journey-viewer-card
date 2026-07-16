/** Visual config editor for journey-viewer-card.
 *
 *  Schema-driven sections (top-level, pagination, label, map, polyline,
 *  empty_state) plus list builders for sources[] and stats_grid.rows[]
 *  (threshold / bar / trend sub-editors included). Anything not surfaced
 *  in the GUI is reachable via HA's own "Show code editor" YAML view.
 *
 *  Architecture: each section gets its own <ha-form> bound to a flat slice of
 *  the config. _onSectionChange merges the slice back at the right path and
 *  fires `config-changed` on the host element.
 */

import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import type { CardConfig } from "../types.js";
import { fireConfigChanged } from "./fire.js";

/** Force-register HA's internal editor primitives (`ha-form`,
 *  `ha-entity-picker`, `hui-card-features-editor`) on first use. They lazy-
 *  register only when a built-in card that needs them renders, so opening
 *  our editor on a fresh dashboard load can show a blank form. Trick stolen
 *  from `lovelace-mushroom/src/utils/loader.ts`: nudge HA's bundled cards to
 *  declare their editors, which side-effect-registers the primitives.
 *  Idempotent + cheap; safe to call from connectedCallback every time. */
function loadHaComponents(): void {
  type WithEditor = { getConfigElement?: () => unknown };
  if (
    !customElements.get("ha-form") ||
    !customElements.get("hui-card-features-editor")
  ) {
    (customElements.get("hui-tile-card") as WithEditor | undefined)
      ?.getConfigElement?.();
  }
  if (!customElements.get("ha-entity-picker")) {
    (customElements.get("hui-entities-card") as WithEditor | undefined)
      ?.getConfigElement?.();
  }
}

import {
  BAR_SCHEMA,
  EMPTY_STATE_SCHEMA,
  HELPERS,
  LABELS,
  LABEL_SCHEMA,
  MAP_SCHEMA,
  PAGINATION_SCHEMA,
  POLYLINE_SCHEMA,
  ROUTE_CUSTOM_SCHEMA,
  ROW_BASE_SCHEMA,
  ROW_CUSTOM_PATH_SCHEMA,
  ROW_DECORATOR_SCHEMA,
  SECTION_DEFAULTS,
  SOURCE_PRESETS,
  SOURCE_SCHEMA,
  THRESHOLD_SCHEMA,
  TOP_LEVEL_SCHEMA,
  TREND_SCHEMA,
  detectSourcePreset,
  type Schema,
} from "./schema.js";
import type {
  BarConfig,
  SourceConfig,
  StatsRow,
  Threshold,
  TrendConfig,
} from "../types.js";
import { STAT_CATALOGUE, findCatalogueEntry } from "./stat-catalogue.js";

/** Static ha-form schemas hoisted to module scope: ha-form memoizes on
 *  schema identity, so a schema rebuilt per render defeats that memoization. */
const ROUTE_PRESET_SCHEMA: Schema = [
  {
    name: "route_preset",
    selector: {
      select: {
        mode: "dropdown",
        options: SOURCE_PRESETS.map((p) => ({ value: p.id, label: p.label })),
      },
    },
  },
];

const STAT_PICKER_SCHEMA: Schema = [
  {
    name: "stat_id",
    selector: {
      select: {
        mode: "dropdown",
        options: STAT_CATALOGUE.map((e) => ({ value: e.id, label: e.label })),
      },
    },
  },
];

/** Source keys owned by the route-preset control, not the source ha-form. */
const PRESET_MANAGED_KEYS = ["route_service", "route_service_data"] as const;

type SectionPath =
  | "top"
  | "pagination"
  | "label"
  | "map"
  | "map.polyline"
  | "empty_state";

export class JourneyViewerCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: CardConfig;
  /** Source indices the user has switched into "Custom service…" mode. Kept
   *  as local editor state (not persisted) so the free-text field stays shown
   *  while the service is empty, without stamping a placeholder into config.
   *  Index-keyed to match the rest of the source UI; remapped on move/remove. */
  @state() private _customRouteRows = new Set<number>();

  override connectedCallback(): void {
    super.connectedCallback();
    loadHaComponents();
  }

  setConfig(config: CardConfig): void {
    this._config = config;
  }

  // ─── Schema-section change handler ─────────────────────────────────────

  private _onSectionChange = (path: SectionPath) => (ev: CustomEvent): void => {
    if (!this._config) return;
    const next = (ev.detail?.value ?? {}) as Record<string, unknown>;
    const merged = this._mergeAtPath(this._config, path, next);
    this._config = merged;
    fireConfigChanged(this, merged);
  };

  private _mergeAtPath(
    config: CardConfig,
    path: SectionPath,
    patch: Record<string, unknown>,
  ): CardConfig {
    // Strip nullish / empty keys so we don't bloat the YAML with `: null`.
    const clean = this._stripEmpty(patch);
    // Defaults are bound into the form data (SECTION_DEFAULTS) so sliders /
    // toggles show reality; delete default-equal keys from the merged section
    // or every edit would persist the whole default set into the YAML (and
    // sliding a customised value BACK to the default couldn't clear it).
    const dropDefaults = (
      o: Record<string, unknown>,
    ): Record<string, unknown> => {
      const defaults = SECTION_DEFAULTS[path];
      if (defaults) {
        for (const [k, v] of Object.entries(defaults)) {
          if (o[k] === v) delete o[k];
        }
      }
      return o;
    };
    // CardConfig fields are typed objects; the merge below works at the
    // generic-record level, then we cast back at the single exit point.
    const cfg = config as Record<string, unknown>;
    let result: Record<string, unknown>;
    if (path === "top") {
      result = { ...cfg, ...clean };
    } else if (path === "map.polyline") {
      const map = { ...((cfg.map as Record<string, unknown>) ?? {}) };
      const polyline = dropDefaults({
        ...((map.polyline as Record<string, unknown>) ?? {}),
        ...clean,
      });
      // Sections reduced to all-defaults leave `map: {}` / `polyline: {}`
      // husks in the YAML — prune them.
      if (Object.keys(polyline).length) map.polyline = polyline;
      else delete map.polyline;
      result = { ...cfg, map };
      if (!Object.keys(map).length) delete result.map;
    } else {
      const section = dropDefaults({
        ...((cfg[path] as Record<string, unknown>) ?? {}),
        ...clean,
      });
      result = { ...cfg };
      if (Object.keys(section).length) result[path] = section;
      else delete result[path];
    }
    return result as CardConfig;
  }

  private _stripEmpty(o: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
      if (v === undefined || v === "" || v === null) continue;
      out[k] = v;
    }
    return out;
  }

  // ─── ha-form helpers ───────────────────────────────────────────────────

  private _computeLabel = (s: { name: string }): string =>
    LABELS[s.name] ?? s.name;

  private _computeHelper = (s: { name: string }): string | undefined =>
    HELPERS[s.name];

  private _renderForm(
    schema: Schema,
    data: unknown,
    path: SectionPath,
  ) {
    // Bind the section's defaults into the form data so unset fields show
    // the value the card actually uses; _mergeAtPath strips default-equal
    // keys back out on change, so inject + strip stay one paired mechanism.
    const bound = {
      ...SECTION_DEFAULTS[path],
      ...((data ?? {}) as Record<string, unknown>),
    };
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${bound}
        .schema=${schema}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onSectionChange(path)}
      ></ha-form>
    `;
  }

  // ─── Render ────────────────────────────────────────────────────────────

  override render() {
    if (!this._config) return nothing;
    const c = this._config;

    const topData = {
      title: c.title,
      order: c.order,
      default_index: c.default_index,
    };

    return html`
      <div class="jve-root">
        ${this._renderForm(TOP_LEVEL_SCHEMA, topData, "top")}

        ${this._section(
          "Sources",
          this._renderSources(c.sources ?? []),
          // Expanded by default: picking a source entity is the one action a
          // fresh card needs, so don't hide it behind a collapsed panel.
          true,
        )}

        ${this._section(
          "Pagination",
          this._renderForm(PAGINATION_SCHEMA, c.pagination, "pagination"),
        )}
        ${this._section(
          "Trip label",
          this._renderForm(LABEL_SCHEMA, c.label, "label"),
        )}
        ${this._section(
          "Map",
          html`
            ${this._renderForm(MAP_SCHEMA, c.map, "map")}
            <div class="jve-subhead">Polyline</div>
            ${this._renderForm(POLYLINE_SCHEMA, c.map?.polyline, "map.polyline")}
          `,
        )}

        ${this._section(
          "Stats grid rows",
          this._renderRows(c.stats_grid?.rows ?? []),
        )}

        ${this._section(
          "Empty state",
          this._renderForm(EMPTY_STATE_SCHEMA, c.empty_state, "empty_state"),
        )}
      </div>
    `;
  }

  private _section(title: string, body: unknown, expanded = false) {
    return html`
      <ha-expansion-panel outlined header=${title} .expanded=${expanded}>
        <div class="jve-body">${body}</div>
      </ha-expansion-panel>
    `;
  }

  // ─── Sources list builder ──────────────────────────────────────────────

  private _renderSources(sources: SourceConfig[]) {
    return html`
      <div class="jve-list">
        ${sources.map((src, i) => this._renderSourceRow(src, i, sources.length))}
        <div class="jve-list-actions">
          <ha-button @click=${this._addSource}>+ Add source</ha-button>
        </div>
      </div>
    `;
  }

  private _renderSourceRow(src: SourceConfig, i: number, total: number) {
    return html`
      <div class="jve-row">
        <div class="jve-row-head">
          <span class="jve-row-title">
            ${src.name || `Source ${i + 1}`}
            ${src.entity ? html`<span class="jve-row-sub">${src.entity}</span>` : nothing}
          </span>
          <div class="jve-row-controls">
            <ha-icon-button
              .disabled=${i === 0}
              .path=${"M7,15L12,10L17,15H7Z"}
              @click=${() => this._moveSource(i, -1)}
              label="Move up"
            ></ha-icon-button>
            <ha-icon-button
              .disabled=${i === total - 1}
              .path=${"M7,10L12,15L17,10H7Z"}
              @click=${() => this._moveSource(i, 1)}
              label="Move down"
            ></ha-icon-button>
            <ha-icon-button
              .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
              @click=${() => this._removeSource(i)}
              label="Remove"
            ></ha-icon-button>
          </div>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${src}
          .schema=${SOURCE_SCHEMA}
          .computeLabel=${this._computeLabel}
          @value-changed=${(ev: CustomEvent) => this._onSourceChange(i, ev)}
        ></ha-form>
        ${this._renderRoutePreset(src, i)}
      </div>
    `;
  }

  /** Route-loading preset select + a free-text service field when Custom. */
  private _renderRoutePreset(src: SourceConfig, i: number) {
    // Sticky custom mode: once the user picks "Custom service…", keep showing
    // the text field even when the service is blank, instead of snapping back
    // to whatever detectSourcePreset() reads from an empty value.
    const preset = this._customRouteRows.has(i)
      ? "custom"
      : detectSourcePreset(src);
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${{ route_preset: preset }}
        .schema=${ROUTE_PRESET_SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${(ev: CustomEvent) => this._onSourcePresetChange(i, ev)}
      ></ha-form>
      ${preset === "custom"
        ? html`<ha-form
            .hass=${this.hass}
            .data=${{ route_service: src.route_service ?? "" }}
            .schema=${ROUTE_CUSTOM_SCHEMA}
            .computeLabel=${this._computeLabel}
            .computeHelper=${this._computeHelper}
            @value-changed=${(ev: CustomEvent) =>
              this._onSourceRouteServiceChange(i, ev)}
          ></ha-form>`
        : nothing}
    `;
  }

  private _onSourcePresetChange = (i: number, ev: CustomEvent): void => {
    if (!this._config) return;
    const next = (ev.detail?.value ?? {}) as { route_preset?: string };
    const preset = SOURCE_PRESETS.find((p) => p.id === next.route_preset);
    if (!preset) return;
    const sources = [...(this._config.sources ?? [])];
    const src = { ...sources[i] };
    const custom = new Set(this._customRouteRows);
    if (preset.id === "custom") {
      // Enter custom mode locally; do NOT persist a placeholder service. Clear
      // a recognized preset's service so the text field starts blank (blank =
      // card default until the user types), and drop the preset payload.
      custom.add(i);
      if (detectSourcePreset(src) !== "custom") {
        delete src.route_service;
      }
      delete src.route_service_data;
    } else {
      custom.delete(i);
      if (preset.route_service !== undefined) {
        src.route_service = preset.route_service;
      } else {
        delete src.route_service;
      }
      if (preset.route_service_data) {
        src.route_service_data = preset.route_service_data;
      } else {
        delete src.route_service_data;
      }
    }
    this._customRouteRows = custom;
    sources[i] = src;
    this._updateSources(sources);
  };

  private _onSourceRouteServiceChange = (i: number, ev: CustomEvent): void => {
    if (!this._config) return;
    const next = (ev.detail?.value ?? {}) as { route_service?: string };
    const sources = [...(this._config.sources ?? [])];
    const src = { ...sources[i] };
    // Blank in custom mode falls back to the card default (delete the key);
    // use the "None" preset to disable route loading entirely. The row stays
    // in custom mode (_customRouteRows) so clearing the field to retype does
    // not collapse the preset select mid-edit.
    if (next.route_service) src.route_service = next.route_service;
    else delete src.route_service;
    sources[i] = src;
    this._updateSources(sources);
  };

  private _onSourceChange = (i: number, ev: CustomEvent): void => {
    if (!this._config) return;
    const next = (ev.detail?.value ?? {}) as SourceConfig;
    const sources = [...(this._config.sources ?? [])];
    const prev = sources[i] ?? ({} as SourceConfig);
    // Strip cleared fields so emptying e.g. `icon` removes the key from the
    // YAML instead of persisting `icon: ""`.
    const merged = this._stripEmpty({
      ...prev,
      ...next,
    }) as unknown as SourceConfig;
    // Route-loading keys are managed by the preset control, not this form -
    // re-attach them verbatim or the strip above silently drops the "None"
    // preset's route_service: null on every unrelated edit.
    for (const k of PRESET_MANAGED_KEYS) {
      if (k in prev) (merged as unknown as Record<string, unknown>)[k] = prev[k];
      else delete merged[k];
    }
    sources[i] = merged;
    this._updateSources(sources);
  };

  private _addSource = (): void => {
    if (!this._config) return;
    const sources = [...(this._config.sources ?? [])];
    sources.push({ name: `Source ${sources.length + 1}` });
    this._updateSources(sources);
  };

  private _removeSource(i: number): void {
    if (!this._config) return;
    const sources = (this._config.sources ?? []).filter((_, j) => j !== i);
    // Drop the removed row's custom flag and shift indices above it down.
    const custom = new Set<number>();
    for (const x of this._customRouteRows) {
      if (x < i) custom.add(x);
      else if (x > i) custom.add(x - 1);
    }
    this._customRouteRows = custom;
    this._updateSources(sources);
  }

  private _moveSource(i: number, dir: -1 | 1): void {
    if (!this._config) return;
    const sources = [...(this._config.sources ?? [])];
    const j = i + dir;
    if (j < 0 || j >= sources.length) return;
    [sources[i], sources[j]] = [sources[j], sources[i]];
    // Swap the two rows' custom flags to follow the moved sources.
    const hadI = this._customRouteRows.has(i);
    const hadJ = this._customRouteRows.has(j);
    const custom = new Set(this._customRouteRows);
    custom.delete(i);
    custom.delete(j);
    if (hadJ) custom.add(i);
    if (hadI) custom.add(j);
    this._customRouteRows = custom;
    this._updateSources(sources);
  }

  private _updateSources(sources: SourceConfig[]): void {
    if (!this._config) return;
    const merged = { ...this._config, sources } as CardConfig;
    this._config = merged;
    fireConfigChanged(this, merged);
  }

  // ─── Stats rows builder ────────────────────────────────────────────────

  private _renderRows(rows: StatsRow[]) {
    return html`
      <div class="jve-list">
        ${rows.map((row, i) => this._renderRowCard(row, i, rows.length))}
        <div class="jve-list-actions">
          <ha-button @click=${this._addRow}>+ Add row</ha-button>
        </div>
      </div>
    `;
  }

  private _renderRowCard(row: StatsRow, i: number, total: number) {
    const entry = findCatalogueEntry(row.key, row.ratio_of);
    return html`
      <div class="jve-row">
        <div class="jve-row-head">
          <span class="jve-row-title">
            ${row.label || `Row ${i + 1}`}
            <span class="jve-row-sub">
              ← ${row.key || "(custom)"}${row.ratio_of
                ? html` ÷ ${row.ratio_of}`
                : nothing}
            </span>
          </span>
          <div class="jve-row-controls">
            <ha-icon-button
              .disabled=${i === 0}
              .path=${"M7,15L12,10L17,15H7Z"}
              @click=${() => this._moveRow(i, -1)}
              label="Move up"
            ></ha-icon-button>
            <ha-icon-button
              .disabled=${i === total - 1}
              .path=${"M7,10L12,15L17,10H7Z"}
              @click=${() => this._moveRow(i, 1)}
              label="Move down"
            ></ha-icon-button>
            <ha-icon-button
              .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
              @click=${() => this._removeRow(i)}
              label="Remove"
            ></ha-icon-button>
          </div>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${{ stat_id: entry.id }}
          .schema=${STAT_PICKER_SCHEMA}
          .computeLabel=${this._computeLabel}
          @value-changed=${(ev: CustomEvent) => this._onRowStatChange(i, ev)}
        ></ha-form>
        ${entry.id === "__custom__"
          ? html`<ha-form
              .hass=${this.hass}
              .data=${{ key: row.key ?? "", ratio_of: row.ratio_of ?? "" }}
              .schema=${ROW_CUSTOM_PATH_SCHEMA}
              .computeLabel=${this._computeLabel}
              @value-changed=${(ev: CustomEvent) =>
                this._onRowFieldsChange(i, ev)}
            ></ha-form>`
          : nothing}
        <ha-form
          .hass=${this.hass}
          .data=${{
            label: row.label,
            icon: row.icon,
            format: row.format,
            decimals: row.decimals,
          }}
          .schema=${ROW_BASE_SCHEMA}
          .computeLabel=${this._computeLabel}
          @value-changed=${(ev: CustomEvent) => this._onRowFieldsChange(i, ev)}
        ></ha-form>

        ${this._subPanel(
          "Thresholds",
          html`
            ${(row.thresholds ?? []).map((t, j) =>
              this._renderThreshold(i, j, t, row.thresholds!.length),
            )}
            <div class="jve-list-actions">
              <ha-button @click=${() => this._addThreshold(i)}
                >+ Add threshold</ha-button
              >
            </div>
            <ha-form
              .hass=${this.hass}
              .data=${{
                color_target: row.color_target ?? "value",
                color_mode: row.color_mode ?? "solid",
              }}
              .schema=${ROW_DECORATOR_SCHEMA}
              .computeLabel=${this._computeLabel}
              @value-changed=${(ev: CustomEvent) =>
                this._onRowFieldsChange(i, ev)}
            ></ha-form>
          `,
        )}
        ${this._subPanel(
          "Bar background",
          html`
            <ha-form
              .hass=${this.hass}
              .data=${row.bar ?? {}}
              .schema=${BAR_SCHEMA}
              .computeLabel=${this._computeLabel}
              @value-changed=${(ev: CustomEvent) => this._onBarChange(i, ev)}
            ></ha-form>
          `,
        )}
        ${this._subPanel(
          "Trend",
          html`
            <ha-form
              .hass=${this.hass}
              .data=${row.trend ?? {}}
              .schema=${TREND_SCHEMA}
              .computeLabel=${this._computeLabel}
              @value-changed=${(ev: CustomEvent) => this._onTrendChange(i, ev)}
            ></ha-form>
          `,
        )}
      </div>
    `;
  }

  private _subPanel(title: string, body: unknown) {
    return html`
      <ha-expansion-panel outlined header=${title} class="jve-subpanel">
        <div class="jve-subpanel-body">${body}</div>
      </ha-expansion-panel>
    `;
  }

  // ─── Thresholds ────────────────────────────────────────────────────────

  private _renderThreshold(
    rowI: number,
    j: number,
    threshold: Threshold,
    total: number,
  ) {
    return html`
      <div class="jve-threshold">
        <div class="jve-threshold-head">
          <span class="jve-threshold-tag">Threshold ${j + 1}</span>
          <div class="jve-row-controls">
            <ha-icon-button
              .disabled=${j === 0}
              .path=${"M7,15L12,10L17,15H7Z"}
              @click=${() => this._moveThreshold(rowI, j, -1)}
              label="Move up"
            ></ha-icon-button>
            <ha-icon-button
              .disabled=${j === total - 1}
              .path=${"M7,10L12,15L17,10H7Z"}
              @click=${() => this._moveThreshold(rowI, j, 1)}
              label="Move down"
            ></ha-icon-button>
            <ha-icon-button
              .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
              @click=${() => this._removeThreshold(rowI, j)}
              label="Remove"
            ></ha-icon-button>
          </div>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${threshold}
          .schema=${THRESHOLD_SCHEMA}
          .computeLabel=${this._computeLabel}
          @value-changed=${(ev: CustomEvent) =>
            this._onThresholdChange(rowI, j, ev)}
        ></ha-form>
      </div>
    `;
  }

  private _addThreshold(rowI: number): void {
    if (!this._config) return;
    const rows = [...(this._config.stats_grid?.rows ?? [])];
    const row = rows[rowI];
    const thresholds = [...(row.thresholds ?? [])];
    const last = thresholds[thresholds.length - 1];
    thresholds.push({ value: last ? last.value + 1 : 0 });
    rows[rowI] = { ...row, thresholds };
    this._updateRows(rows);
  }

  private _removeThreshold(rowI: number, j: number): void {
    if (!this._config) return;
    const rows = [...(this._config.stats_grid?.rows ?? [])];
    const row = rows[rowI];
    const thresholds = (row.thresholds ?? []).filter((_, k) => k !== j);
    rows[rowI] = {
      ...row,
      ...(thresholds.length ? { thresholds } : {}),
    };
    if (!thresholds.length) {
      delete (rows[rowI] as { thresholds?: unknown }).thresholds;
    }
    this._updateRows(rows);
  }

  private _moveThreshold(rowI: number, j: number, dir: -1 | 1): void {
    if (!this._config) return;
    const rows = [...(this._config.stats_grid?.rows ?? [])];
    const row = rows[rowI];
    const thresholds = [...(row.thresholds ?? [])];
    const k = j + dir;
    if (k < 0 || k >= thresholds.length) return;
    [thresholds[j], thresholds[k]] = [thresholds[k], thresholds[j]];
    rows[rowI] = { ...row, thresholds };
    this._updateRows(rows);
  }

  private _onThresholdChange(
    rowI: number,
    j: number,
    ev: CustomEvent,
  ): void {
    if (!this._config) return;
    const next = (ev.detail?.value ?? {}) as Threshold;
    const rows = [...(this._config.stats_grid?.rows ?? [])];
    const row = rows[rowI];
    const thresholds = [...(row.thresholds ?? [])];
    thresholds[j] = { ...thresholds[j], ...next };
    // Strip empty optional fields.
    if (!next.color) delete thresholds[j].color;
    if (!next.icon) delete thresholds[j].icon;
    rows[rowI] = { ...row, thresholds };
    this._updateRows(rows);
  }

  // ─── Bar / Trend sub-objects ───────────────────────────────────────────

  private _onBarChange(i: number, ev: CustomEvent): void {
    if (!this._config) return;
    const next = (ev.detail?.value ?? {}) as BarConfig;
    const rows = [...(this._config.stats_grid?.rows ?? [])];
    const row = rows[i];
    const bar = this._stripEmpty(next as Record<string, unknown>);
    rows[i] = Object.keys(bar).length
      ? { ...row, bar: bar as BarConfig }
      : (() => {
          const { bar: _omit, ...rest } = row;
          return rest as StatsRow;
        })();
    this._updateRows(rows);
  }

  private _onTrendChange(i: number, ev: CustomEvent): void {
    if (!this._config) return;
    const next = (ev.detail?.value ?? {}) as TrendConfig;
    const rows = [...(this._config.stats_grid?.rows ?? [])];
    const row = rows[i];
    const trend = this._stripEmpty(next as Record<string, unknown>);
    rows[i] = Object.keys(trend).length
      ? { ...row, trend: trend as TrendConfig }
      : (() => {
          const { trend: _omit, ...rest } = row;
          return rest as StatsRow;
        })();
    this._updateRows(rows);
  }

  /** User picked a different entry from the stat catalogue. Stamp key,
   *  ratio_of, and re-seed label/format/icon/decimals — but only fields the
   *  user hasn't customised, i.e. fields still equal to the PREVIOUS entry's
   *  defaults. Otherwise switching Distance → Duration keeps "Distance" +
   *  the km formatter and renders nonsense ("441 m" for a 441 s duration). */
  private _onRowStatChange = (i: number, ev: CustomEvent): void => {
    if (!this._config) return;
    const next = (ev.detail?.value ?? {}) as { stat_id?: string };
    if (!next.stat_id) return;
    const entry = STAT_CATALOGUE.find((e) => e.id === next.stat_id);
    if (!entry) return;
    const rows = [...(this._config.stats_grid?.rows ?? [])];
    const existing = rows[i] ?? { label: "" };
    const stamped: StatsRow = { ...existing };
    const prev = findCatalogueEntry(existing.key, existing.ratio_of);

    if (entry.id === "__custom__") {
      // Don't overwrite key/ratio_of when switching TO custom — keep what's
      // already there so the user can edit. Just clear any fixed catalogue
      // mapping.
    } else {
      stamped.key = entry.key;
      if (entry.ratio_of) stamped.ratio_of = entry.ratio_of;
      else delete stamped.ratio_of;
    }

    // A field is "untouched" when empty OR still carrying the previous
    // entry's default — either way the user hasn't customised it.
    const untouched = (v: unknown, prevDefault: unknown) =>
      v == null || v === "" || v === prevDefault;
    if (untouched(stamped.label, prev.label)) stamped.label = entry.label;
    if (untouched(stamped.format, prev.defaultFormat)) {
      if (entry.defaultFormat) stamped.format = entry.defaultFormat;
      else delete stamped.format;
    }
    if (untouched(stamped.icon, prev.defaultIcon)) {
      if (entry.defaultIcon) stamped.icon = entry.defaultIcon;
      else delete stamped.icon;
    }
    if (untouched(stamped.decimals, prev.defaultDecimals)) {
      if (entry.defaultDecimals != null) stamped.decimals = entry.defaultDecimals;
      else delete stamped.decimals;
    }

    rows[i] = stamped;
    this._updateRows(rows);
  };

  private _onRowFieldsChange = (i: number, ev: CustomEvent): void => {
    if (!this._config) return;
    const next = (ev.detail?.value ?? {}) as Record<string, unknown>;
    const rows = [...(this._config.stats_grid?.rows ?? [])];
    const existing = rows[i] ?? ({ label: "" } as StatsRow);
    const merged = { ...existing, ...this._stripEmpty(next) } as StatsRow;
    // _stripEmpty drops cleared fields. Make sure cleared decimals/icon
    // actually delete from the row instead of keeping the old value.
    // (All four keys are optional on StatsRow, so `delete` is well-typed.)
    for (const k of ["icon", "format", "decimals", "ratio_of"] as const) {
      if (next[k] === "" || next[k] === null || next[k] === undefined) {
        delete merged[k];
      }
    }
    rows[i] = merged;
    this._updateRows(rows);
  };

  private _addRow = (): void => {
    if (!this._config) return;
    const rows = [...(this._config.stats_grid?.rows ?? [])];
    const distance = STAT_CATALOGUE[0];
    rows.push({
      key: distance.key,
      label: distance.label,
      format: distance.defaultFormat,
      icon: distance.defaultIcon,
      decimals: distance.defaultDecimals,
    } as StatsRow);
    this._updateRows(rows);
  };

  private _removeRow(i: number): void {
    if (!this._config) return;
    const rows = (this._config.stats_grid?.rows ?? []).filter((_, j) => j !== i);
    this._updateRows(rows);
  }

  private _moveRow(i: number, dir: -1 | 1): void {
    if (!this._config) return;
    const rows = [...(this._config.stats_grid?.rows ?? [])];
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    [rows[i], rows[j]] = [rows[j], rows[i]];
    this._updateRows(rows);
  }

  private _updateRows(rows: StatsRow[]): void {
    if (!this._config) return;
    const stats_grid = { ...(this._config.stats_grid ?? { rows: [] }), rows };
    const merged = { ...this._config, stats_grid } as CardConfig;
    this._config = merged;
    fireConfigChanged(this, merged);
  }

  static override styles = css`
    :host {
      display: block;
    }
    .jve-root {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    ha-expansion-panel {
      --expansion-panel-summary-padding: 0 12px;
      --expansion-panel-content-padding: 0;
    }
    .jve-body {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .jve-subhead {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }
    .jve-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .jve-list-actions {
      display: flex;
      justify-content: flex-end;
    }
    .jve-row {
      border: 1px solid var(--divider-color, #333);
      border-radius: 8px;
      padding: 8px 12px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .jve-row-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .jve-row-title {
      font-weight: 600;
      font-size: 0.95rem;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .jve-row-sub {
      font-weight: 400;
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }
    .jve-row-controls {
      display: flex;
      gap: 0;
    }
    .jve-subpanel {
      --expansion-panel-summary-padding: 0 8px;
      --expansion-panel-content-padding: 0;
      margin-top: 4px;
    }
    .jve-subpanel-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
    }
    .jve-threshold {
      display: flex;
      flex-direction: column;
      gap: 4px;
      border: 1px dashed var(--divider-color, #333);
      border-radius: 6px;
      padding: 4px 8px 8px;
    }
    .jve-threshold-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .jve-threshold-tag {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "journey-viewer-card-editor": JourneyViewerCardEditor;
  }
}

// Guarded registration. Same rationale as the card itself: the bundle may be
// re-evaluated on HACS hot-reload or manual import(); the @customElement
// decorator throws on duplicate, manual define + presence check is idempotent.
if (!customElements.get("journey-viewer-card-editor")) {
  customElements.define("journey-viewer-card-editor", JourneyViewerCardEditor);
}
