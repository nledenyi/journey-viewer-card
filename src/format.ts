/** Tiny formatters used by the label template + stats grid. */

const PAD = (n: number, w = 2) => String(n).padStart(w, "0");

export function formatRelativeDay(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dDay = new Date(d);
  dDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - dDay.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTime(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${PAD(d.getHours())}:${PAD(d.getMinutes())}`;
}

export function formatDistance(meters: number | null | undefined): string {
  if (meters == null) return "—";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m < 60) return `${m}:${PAD(sec)}`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h ${PAD(min)}m`;
}

export function formatVolume(
  ml: number | null | undefined,
  decimals = 3,
): string {
  if (ml == null) return "—";
  return `${(ml / 1000).toFixed(decimals)} L`;
}

/** Tokens recognised by the card's `label.template` config. Listed once so
 *  validateLabelTemplate() and renderLabel() agree on the supported set. */
export const LABEL_TOKENS = [
  "{relative_day}",
  "{start_time}",
  "{end_time}",
  "{distance}",
  "{duration}",
] as const;

/** Return the list of `{tokens}` in the template that aren't in LABEL_TOKENS.
 *  Empty array means the template is valid; a non-empty array is the error
 *  surface for setConfig validation. */
export function validateLabelTemplate(template: string): string[] {
  const supported = new Set<string>(LABEL_TOKENS);
  const found = template.match(/\{[^}]+\}/g) ?? [];
  return Array.from(new Set(found.filter((t) => !supported.has(t))));
}

/** Compose the card's top-row label from the configured template.
 *
 *  Supported tokens (see LABEL_TOKENS):
 *  - `{relative_day}`  - "Today" / "Yesterday" / "Mon" / "2026-04-27"
 *  - `{start_time}`    - HH:MM of trip start
 *  - `{end_time}`      - HH:MM of trip end
 *  - `{distance}`      - "1.22 km" / "876 m"
 *  - `{duration}`      - "4:25" / "1h 23m" / "45s"
 */
export function renderLabel(template: string, trip: {
  start_ts?: string;
  end_ts?: string;
  stats: { distance_m?: number | null; duration_s?: number | null };
}): string {
  return template
    .replace("{relative_day}", formatRelativeDay(trip.start_ts))
    .replace("{start_time}", formatTime(trip.start_ts))
    .replace("{end_time}", formatTime(trip.end_ts))
    .replace("{distance}", formatDistance(trip.stats.distance_m))
    .replace("{duration}", formatDuration(trip.stats.duration_s));
}

/** Format a single stats-grid row value. */
export function formatStat(
  value: unknown,
  format: string | undefined,
  decimals: number | undefined,
): string {
  if (value == null) return "—";
  if (typeof value !== "number" && typeof value !== "string" && typeof value !== "boolean")
    return "—";

  const v = typeof value === "number" ? value : Number(value);
  if (format === "km") return formatDistance(v);
  if (format === "L") return formatVolume(v, decimals ?? 3);
  if (format === "duration") return formatDuration(v);

  if (format && format.includes("{v")) {
    // Light templating: "{v:.1f}" / "{v:.0%}" / "{v} / 100"
    return format
      .replace(/\{v:\.0%\}/g, `${Math.round(v * 100)}%`)
      .replace(/\{v:\.(\d+)f\}/g, (_m, d) => v.toFixed(Number(d)))
      .replace(/\{v\}/g, String(v));
  }

  if (decimals != null && typeof v === "number") return v.toFixed(decimals);
  return String(value);
}
