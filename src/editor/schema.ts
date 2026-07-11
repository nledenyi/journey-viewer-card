/** ha-form schemas, one per editable section.
 *
 *  Sections deliberately get their own forms so the data binding stays flat
 *  inside each (no nested `expandable + flatten:false` gymnastics). The host
 *  editor merges each section's output back into the right slice of config.
 */

export type Schema = readonly Record<string, unknown>[];

export const TOP_LEVEL_SCHEMA: Schema = [
  { name: "title", selector: { text: {} } },
  {
    type: "grid",
    schema: [
      {
        name: "order",
        selector: { select: { options: ["newest_first", "oldest_first"] } },
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
        selector: { select: { options: ["locked", "enabled"] } },
      },
      {
        name: "tile_provider",
        selector: {
          select: {
            options: ["openstreetmap", "carto-positron", "carto-dark-matter"],
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
            options: ["solid", "ev", "overspeed", "highway", "mode"],
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
        selector: { select: { options: ["value", "tile"] } },
      },
      {
        name: "color_mode",
        selector: { select: { options: ["solid", "gradient"] } },
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
            options: ["after_value", "before_value", "replace_icon"],
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
  {
    type: "grid",
    schema: [
      { name: "name", required: true, selector: { text: {} } },
      { name: "icon", selector: { icon: {} } },
    ],
  },
  { name: "entity", selector: { entity: {} } },
  // Plain text so CSS vars / named colors survive round-tripping.
  { name: "color", selector: { text: {} } },
];

export const EMPTY_STATE_SCHEMA: Schema = [
  { name: "title", selector: { text: {} } },
  { name: "body", selector: { text: { multiline: true } } },
  { name: "icon", selector: { icon: {} } },
];

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
