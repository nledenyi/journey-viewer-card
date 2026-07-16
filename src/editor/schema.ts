/** ha-form schemas, one per editable section.
 *
 *  Sections deliberately get their own forms so the data binding stays flat
 *  inside each (no nested `expandable + flatten:false` gymnastics). The host
 *  editor merges each section's output back into the right slice of config.
 */

import { LABEL_TOKENS } from "../format.js";

export type Schema = readonly Record<string, unknown>[];

export const TOP_LEVEL_SCHEMA: Schema = [
  { name: "title", selector: { text: {} } },
  {
    type: "grid",
    schema: [
      {
        name: "order",
        selector: {
          select: {
            options: [
              { value: "newest_first", label: "Newest first" },
              { value: "oldest_first", label: "Oldest first" },
            ],
          },
        },
      },
      { name: "default_index", selector: { number: { min: 0, mode: "box" } } },
    ],
  },
];

export const PAGINATION_SCHEMA: Schema = [
  {
    type: "grid",
    schema: [
      { name: "show_counter", selector: { boolean: {} } },
      { name: "wrap", selector: { boolean: {} } },
      { name: "keyboard", selector: { boolean: {} } },
    ],
  },
];

export const LABEL_SCHEMA: Schema = [
  { name: "template", selector: { text: {} } },
];

export const MAP_SCHEMA: Schema = [
  {
    type: "grid",
    schema: [
      {
        name: "height",
        selector: { number: { min: 120, max: 800, mode: "slider", step: 10 } },
      },
      {
        name: "padding_pct",
        selector: { number: { min: 0, max: 30, mode: "box" } },
      },
      {
        name: "gestures",
        selector: {
          select: {
            options: [
              { value: "locked", label: "Locked (page scrolls over map)" },
              { value: "enabled", label: "Enabled (pan & zoom)" },
            ],
          },
        },
      },
      {
        name: "tile_provider",
        selector: {
          select: {
            options: [
              { value: "auto", label: "Auto (follow theme)" },
              { value: "openstreetmap", label: "OpenStreetMap" },
              { value: "carto-positron", label: "Carto Positron (light)" },
              { value: "carto-dark-matter", label: "Carto Dark Matter (dark)" },
            ],
          },
        },
      },
      { name: "zoom_to_fit", selector: { boolean: {} } },
    ],
  },
];

export const POLYLINE_SCHEMA: Schema = [
  {
    type: "grid",
    schema: [
      {
        name: "color_by",
        selector: {
          select: {
            options: [
              { value: "solid", label: "Solid colour" },
              { value: "ev", label: "EV vs combustion" },
              { value: "overspeed", label: "Overspeed" },
              { value: "highway", label: "Highway vs city" },
              { value: "mode", label: "Mode (multi-modal)" },
            ],
          },
        },
      },
      {
        name: "weight",
        selector: { number: { min: 1, max: 10, mode: "slider", step: 1 } },
      },
      {
        name: "opacity",
        selector: { number: { min: 0, max: 1, mode: "slider", step: 0.05 } },
      },
    ],
  },
];

export const ROW_BASE_SCHEMA: Schema = [
  {
    type: "grid",
    schema: [
      { name: "label", required: true, selector: { text: {} } },
      { name: "icon", selector: { icon: {} } },
    ],
  },
  {
    type: "grid",
    schema: [
      { name: "format", selector: { text: {} } },
      {
        name: "decimals",
        selector: { number: { min: 0, max: 6, mode: "box" } },
      },
    ],
  },
];

export const ROW_CUSTOM_PATH_SCHEMA: Schema = [
  {
    type: "grid",
    schema: [
      { name: "key", required: true, selector: { text: {} } },
      { name: "ratio_of", selector: { text: {} } },
    ],
  },
];

export const ROW_DECORATOR_SCHEMA: Schema = [
  {
    type: "grid",
    schema: [
      {
        name: "color_target",
        selector: {
          select: {
            options: [
              { value: "value", label: "Value text" },
              { value: "tile", label: "Tile background" },
            ],
          },
        },
      },
      {
        name: "color_mode",
        selector: {
          select: {
            options: [
              { value: "solid", label: "Solid" },
              { value: "gradient", label: "Gradient" },
            ],
          },
        },
      },
    ],
  },
];

export const THRESHOLD_SCHEMA: Schema = [
  {
    type: "grid",
    schema: [
      {
        name: "value",
        required: true,
        selector: { number: { mode: "box", step: 0.01 } },
      },
      // Plain text, NOT type:"color": color pickers only emit hex, which
      // would mangle var(--error-color)-style values the README documents.
      { name: "color", selector: { text: {} } },
      { name: "icon", selector: { icon: {} } },
    ],
  },
];

export const BAR_SCHEMA: Schema = [
  { name: "max", selector: { text: {} } },
  {
    type: "grid",
    schema: [
      { name: "color", selector: { text: {} } },
      { name: "track", selector: { text: {} } },
    ],
  },
];

export const TREND_SCHEMA: Schema = [
  {
    type: "grid",
    schema: [
      {
        name: "position",
        selector: {
          select: {
            options: [
              { value: "after_value", label: "After value" },
              { value: "before_value", label: "Before value" },
              { value: "replace_icon", label: "Replace icon" },
            ],
          },
        },
      },
      { name: "show_delta", selector: { boolean: {} } },
      { name: "invert", selector: { boolean: {} } },
    ],
  },
  {
    name: "format",
    selector: {
      select: {
        custom_value: true,
        mode: "dropdown",
        options: [
          { value: "{v:.1f}", label: "1 decimal ({v:.1f})" },
          { value: "{v:.2f}", label: "2 decimals ({v:.2f})" },
          { value: "{v:.0%}", label: "Percent ({v:.0%})" },
          { value: "km", label: "Kilometres (km)" },
          { value: "L", label: "Litres (L)" },
          { value: "duration", label: "Duration (mm:ss)" },
        ],
      },
    },
  },
];

export const SOURCE_SCHEMA: Schema = [
  // Entity first: it's the one required action for a working card.
  { name: "entity", selector: { entity: {} } },
  {
    type: "grid",
    schema: [
      { name: "name", required: true, selector: { text: {} } },
      { name: "icon", selector: { icon: {} } },
    ],
  },
  // Plain text so CSS vars / named colors survive round-tripping.
  { name: "color", selector: { text: {} } },
];

/** Route-loading presets offered per source. Picking one stamps
 *  route_service + route_service_data onto the source config; the config
 *  itself never stores a `preset` key. */
export interface SourcePreset {
  id: string;
  label: string;
  /** undefined = delete both keys (card default = ha_toyota shape). */
  route_service?: string | null;
  route_service_data?: Record<string, string>;
}

export const SOURCE_PRESETS: SourcePreset[] = [
  {
    id: "toyota",
    label: "Toyota (ha_toyota fork)",
    // Card defaults - both keys deleted from YAML.
  },
  {
    id: "strava",
    label: "Strava (ha_strava 4.3.1+)",
    route_service: "ha_strava.get_activity_route",
    route_service_data: { activity_id: "$trip_id" },
  },
  {
    id: "none",
    label: "None (routes inline / no route)",
    route_service: null,
  },
  {
    id: "custom",
    label: "Custom service…",
  },
];

/** Map a source's stored route_service back to a preset id. */
export function detectSourcePreset(routeService: string | null | undefined): string {
  if (routeService === null || routeService === "") return "none";
  if (routeService === undefined || routeService === "toyota.get_trip_route")
    return "toyota";
  if (routeService === "ha_strava.get_activity_route") return "strava";
  return "custom";
}

export const ROUTE_CUSTOM_SCHEMA: Schema = [
  { name: "route_service", selector: { text: {} } },
];

export const EMPTY_STATE_SCHEMA: Schema = [
  { name: "title", selector: { text: {} } },
  { name: "body", selector: { text: { multiline: true } } },
  { name: "icon", selector: { icon: {} } },
];

/** Card-side defaults per editor section, bound into each ha-form's data so
 *  unset fields show the value the card actually uses (an empty slider at
 *  minimum position lies about height=280). The section-change handler strips
 *  keys equal to these before persisting, so the YAML stays minimal. Must
 *  match the fallbacks in card.ts / map.ts. */
export const SECTION_DEFAULTS: Record<string, Record<string, unknown>> = {
  pagination: { show_counter: true, wrap: false, keyboard: true },
  map: {
    height: 280,
    padding_pct: 10,
    gestures: "locked",
    tile_provider: "auto",
    zoom_to_fit: false,
  },
  "map.polyline": { color_by: "solid", weight: 4, opacity: 0.9 },
};

/** Helper text under specific fields, looked up by schema field name via
 *  ha-form's computeHelper. Kept sparse — only where the field's value
 *  grammar isn't guessable from its label. */
export const HELPERS: Record<string, string> = {
  template: `Tokens: ${LABEL_TOKENS.join(" ")}`,
  route_service:
    "Blank falls back to the default Toyota service; pick the None preset to disable route loading.",
};

/** English label map. Schema field names translate to user-facing strings. */
export const LABELS: Record<string, string> = {
  title: "Title",
  order: "Trip order",
  default_index: "Default trip index",

  position: "Position",
  show_counter: "Show counter",
  wrap: "Wrap at edges",
  keyboard: "Keyboard arrows",

  template: "Label template",

  height: "Map height (px)",
  padding_pct: "Fit padding (%)",
  gestures: "Gestures",
  tile_provider: "Tile provider",
  zoom_to_fit: "Zoom to fit route",

  color_by: "Colour by",
  weight: "Line weight",
  opacity: "Line opacity",

  body: "Body",
  icon: "Icon",

  name: "Name",
  entity: "Entity",
  color: "Colour",
  route_service: "Route service (domain.service)",
  route_preset: "Route loading",

  label: "Label",
  format: "Format",
  decimals: "Decimals",
  key: "Key (dot-path)",
  ratio_of: "Ratio of (dot-path, optional)",
  stat_id: "Stat",

  color_target: "Colour target",
  color_mode: "Colour mode",
  value: "Value (>=)",
  max: "Max (number or dot-path)",
  track: "Track colour",
  show_delta: "Show numeric delta",
  invert: "Invert (lower = better)",
};
