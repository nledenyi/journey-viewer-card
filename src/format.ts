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

/** Running/cycling pace from seconds-per-km: "5:32 /km". */
export function formatPace(secPerKm: number | null | undefined): string {
  if (secPerKm == null || !Number.isFinite(secPerKm) || secPerKm <= 0)
    return "—";
  const s = Math.round(secPerKm);
  return `${Math.floor(s / 60)}:${PAD(s % 60)} /km`;
}

/** Tokens recognised by the card's `label.template` config. Listed once so
 *  validateLabelTemplate() and renderLabel() agree on the supported set. */
export const LABEL_TOKENS = [
  "{relative_day}",
  "{start_time}",
  "{end_time}",
  "{distance}",
  "{duration}",
  "{label}",
  "{activity_type}",
  "{source}",
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
 *  - `{relative_day}`   - "Today" / "Yesterday" / "Mon" / "2026-04-27"
 *  - `{start_time}`     - HH:MM of trip start
 *  - `{end_time}`       - HH:MM of trip end
 *  - `{distance}`       - "1.22 km" / "876 m"
 *  - `{duration}`       - "4:25" / "1h 23m" / "45s"
 *  - `{label}`          - the trip's own title ("Morning Run"); "" if absent
 *  - `{activity_type}`  - contract activity_type ("drive", "run"); "" if absent
 *  - `{source}`         - trip's source string; "" if absent
 */
export function renderLabel(template: string, trip: {
  start_ts?: string;
  end_ts?: string;
  label?: string | null;
  activity_type?: string | null;
  source?: string | null;
  stats: { distance_m?: number | null; duration_s?: number | null };
}): string {
  const values: Record<string, string> = {
    "{relative_day}": formatRelativeDay(trip.start_ts),
    "{start_time}": formatTime(trip.start_ts),
    "{end_time}": formatTime(trip.end_ts),
    "{distance}": formatDistance(trip.stats.distance_m),
    "{duration}": formatDuration(trip.stats.duration_s),
    "{label}": trip.label ?? "",
    "{activity_type}": trip.activity_type ?? "",
    "{source}": trip.source ?? "",
  };
  // Single pass so substituted text is never re-scanned: brace text inside
  // trip-supplied fields ({label} etc.) can't get substituted again. Tokens
  // that resolve to "" leave a \0 sentinel so the cleanup below collapses
  // only the whitespace they orphan, not spacing the template author wrote.
  const out = template.replace(/\{[a-z_]+\}/g, (token) => {
    const v = values[token];
    if (v === undefined) return token; // unknown; setConfig validation's job
    return v === "" ? "\0" : v;
  });
  return out
    .replace(/\s*\0+\s*/g, (m) => (/\s/.test(m) ? " " : ""))
    .trim();
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
  // Numeric formats on a non-numeric value ("unknown", "n/a") would render
  // literal "NaN" strings - fall back to the placeholder instead.
  const numeric = Number.isFinite(v);
  if (format === "km") return numeric ? formatDistance(v) : "—";
  if (format === "L") return numeric ? formatVolume(v, decimals ?? 3) : "—";
  if (format === "duration") return numeric ? formatDuration(v) : "—";
  if (format === "pace") return numeric ? formatPace(v) : "—";

  if (format && format.includes("{v")) {
    if (!numeric) return "—";
    // Light templating: "{v:.1f}" / "{v:.0%}" / "{v} / 100"
    return format
      .replace(/\{v:\.0%\}/g, `${Math.round(v * 100)}%`)
      .replace(/\{v:\.(\d+)f\}/g, (_m, d) => v.toFixed(Number(d)))
      .replace(/\{v\}/g, String(v));
  }

  if (decimals != null && numeric) return v.toFixed(decimals);
  return String(value);
}
