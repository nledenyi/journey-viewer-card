/** Config defaults shared between the card runtime and the editor.
 *
 *  The editor binds these into each section's ha-form data so unset fields
 *  show the value the card actually uses (schema.ts SECTION_DEFAULTS), and
 *  the runtime uses them as its `??` fallbacks — one definition, no drift.
 *
 *  Not every default is a `??` fallback at runtime: `show_counter` /
 *  `keyboard` use the `!== false` idiom (default true by construction),
 *  `gestures` uses `!== "enabled"` (default locked), and `tile_provider`
 *  "auto" is resolveTileKey's unset branch. Those stay literal here for the
 *  editor's benefit; changing them means changing the runtime idiom too.
 */

import type { ColorBy } from "./types.js";

export const PAGINATION_DEFAULTS = {
  show_counter: true,
  wrap: false,
  keyboard: true,
};

export const MAP_DEFAULTS = {
  height: 280,
  padding_pct: 10,
  gestures: "locked",
  tile_provider: "auto",
  zoom_to_fit: false,
};

export const POLYLINE_DEFAULTS = {
  color_by: "solid" as ColorBy,
  weight: 4,
  opacity: 0.9,
};
