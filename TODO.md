# journey-viewer-card — deferred items

Best-practice items + features explicitly deferred. Pick from here when picking the card back up.

## Status snapshot (2026-04-26)

**Where we are**: v0.1 dev. Vite harness runs against synthetic in-memory trips defined inline in `dev/main.ts`; live HA wiring uses a producer integration that exposes `attributes.trips[]`. Bundle ~411 KB / ~103 KB gzipped, single file.

**Live in HA `lovelace-playground` dashboard**:
- `/journey-showcase` — single comprehensive view exercising every card config option against `sensor.rav4_recent_trips`

**What's done in this session** (carried out top-to-bottom):
1. **Killed the `computed` enum**, replaced with `ratio_of` dot-path. Source-agnostic ratio is now `key / ratio_of`. Migrated three rows in the live dashboard via `python_transform`.
2. **Visual editor shipped** end-to-end (`src/editor/`). Hybrid pattern: ha-form schemas for non-array sections, custom Lit widgets for `sources[]` and `stats_grid.rows[]`, YAML fallback for the long tail. Stat catalogue has 11 named-metric entries + custom-path escape hatch. Polish: threshold ladder uses tag header + horizontal controls; trend `format` is a dropdown with 6 presets + `custom_value`. **Caveat**: editor verified via manual Playwright mount, NOT yet in the actual HA card-edit dialog (next pickup item).
3. **`scripts/strava-fixture.py`** — stdlib-only OAuth + paginating Strava fetch + polyline decoder + Trip-shape mapping. Headless gotcha solved by `curl localhost:8721/callback?code=...` from a second SSH session. Has `--since`, `--detailed`, `--out` flags.
4. **`docs/learnings.md`** updated with the visual-editor section (~190 lines added). Now 700 lines, ready to graduate to a proper skill.

## Foundation polish (post-v1)

- [ ] **Verify visual editor in real HA card-edit dialog**. Manual mount confirms 90% but `ha-entity-picker` renders 0×0 outside the real dialog (needs registry context). Open card-edit on the Strava view's card and click through every sub-panel before declaring the editor truly done.
- [ ] **Headless-friendly auth in `strava-fixture.py`** — add `--code <code>` flag (or stdin paste) so a second SSH session + curl trick isn't needed. `oauth_initial()` should detect headless (no `DISPLAY` and no callback served within ~5s) and switch to "paste the redirect URL" mode.
- [ ] **Localisation layer** (`src/localize/languages/en.json` + `localize()` helper). Hardcoded English strings: pagination tooltips, empty-state text, stats-row default labels, editor field labels (`src/editor/schema.ts:LABELS`).
- [ ] **Tap/hold action handlers** if we add clickable per-trip actions (e.g. "open in detail view", "share trip URL"). Use `handleAction` from `custom-card-helpers`.
- [ ] **ESLint + Prettier** rig (boilerplate-card uses both). Skip until HACS submission.
- [ ] **Trend format inheritance for `{v:.N%}` / `{v:.Nf}` templates**. Currently inherits row.format only for unit-converter presets (`km`, `L`, `duration`); pure-numeric templates fall through to smart defaults. Could be cleaner: detect templates with no max-suffix and inherit those too.

## Bubble Card visual harmony

### Tier 1 — Bubble Card-style pills natively (~½ day)

Restyle the stats grid tiles to look like Bubble Card sub-buttons: rounded pills, icon-left, value-right, larger tap target. No Bubble Card runtime dependency — pure CSS mimicry. Picks up the visual language of Bubble Card-heavy dashboards without forcing the install.

- [ ] Add `stats_grid.style: tile | pill` config (default `tile` = current behaviour; `pill` = Bubble Card-flavoured)
- [ ] Per-style CSS class set: rounded-rect / pill, icon-left layout, mobile full-width row
- [ ] Document both styles in README with screenshots

### Tier 2 — Real Bubble Card embed via auto-generated sensors (~2 days)

Defer until at least one user explicitly asks for it. Approach: when `stats_renderer: bubble`, the card creates one HA input_number / template helper per stat field (`sensor.<card_id>_distance`, `_duration`, etc.), updates them on every pagination tick, and the user composes a Bubble Card sub-button row pointing at those sensors.

Concerns to resolve before shipping:
- Recorder bloat from rapid sensor updates (every prev/next click triggers state writes for ~8 sensors). May need `recorder.exclude` advice in docs.
- Auto-creating helpers from a frontend card is unusual — investigate if HA's frontend allows this or if it requires a backend integration.
- Two cards stacked (ours + Bubble Card) means more YAML. UX cost vs benefit.

### Tier 3 — Full Bubble Card sub-card embed (~1 week)

**Don't bother.** Reaches into Bubble Card internals (card-mod-heavy, JS-template-heavy, not designed for inline data passing), creates tight coupling to a third-party card's release cadence. Effort-to-value ratio doesn't justify.

## Features deferred from v1 design

- [ ] **Multi-source single view** — render Toyota + Strava fixtures in one card so trips interleave or tab. Right now each fixture has its own dashboard view; the multi-source `sources: []` config has been validated as data-shape-agnostic but never actually combined live.
- [ ] **Combined view** (`default_view: combined`) — interleave trips by timestamp across sources. Currently each source is rendered serially.
- [ ] **Speed-coloured polyline** (`color_by: speed`). Toyota's per-route-point data lacks per-point speed; needs telemetry endpoint or a different source. Strava `streams` endpoint exposes velocity_smooth; could be added to the fixture script.
- [ ] **Compare two trips overlay**. Cute, not required.
- [ ] **Trip dropdown selector**. Tapping the label opens a list to jump to a specific trip. Useful past 10+ trips (Strava view at 13 already feels it).
- [ ] **Map full-screen toggle**. Some users want to expand the map. Skip — over-scoped.

## Upstream PRs that unlock real-data sources for this card

### `craibo/ha_strava` — decode polyline + raise the 10-activity cap

**Test bed already secured** via `scripts/strava-fixture.py` (no integration changes needed for our dev). PR-to-upstream is a separate concern, framed by what we learned during the script work.

Two issues with the integration as shipped:
1. **`per_page=200` hardcoded in `coordinator.py:140`** — no pagination. Users with >200 activities can't reach older ones.
2. **`CONF_NUM_RECENT_ACTIVITIES_MAX = 10`** in `const.py:46`, sliced at `coordinator.py:579`. Only 10 activities exposed to HA regardless of how many were fetched.
3. (Original gap, still valid) — `summary_polyline` is exposed encoded; consumers need their own decoder.

**Combined PR scope** (~3-4 hours, ~80 lines):
- Add `CONF_INCLUDE_FULL_HISTORY` flag (default off). When on, `_fetch_activities` paginates with `before` until empty, throttled to stay under 100 req/15min.
- Raise `CONF_NUM_RECENT_ACTIVITIES_MAX` to e.g. 200.
- Add `CONF_ATTR_ROUTE = "route"` and decode `summary_polyline` to `[[lat, lon], ...]` (Google-polyline algorithm, ~20 lines, see `scripts/strava-fixture.py:decode_polyline` for reference impl).
- Surface decoded `route` as a sensor attribute.
- Unit-test the decoder against a known input (Strava's docs have one).
- Comment on [#196](https://github.com/craibo/ha_strava/issues/196).

**Decision pending**: do we file the PR now (gives users an actionable upgrade path) or wait until journey-viewer-card lands in HACS so the issue thread has a recommended renderer to point at? Current lean: wait. Unmerged PRs go stale.

**Don't bother with**: a `camera.strava_activity_map` static-map render. Once journey-viewer-card ships in HACS, it's redundant.

## Backend wiring

- [ ] **Build the `sensor.<car>_recent_trips` template / coordinator-backed sensor on the ha_toyota side.** Until then the card runs on `fallback_fixture_url`. Landing target post-rate-limit-resilience PR merge.
- [ ] **Avoid recorder bloat** — the trip sensor's attributes can be 100s of KB if we expose all 5 trips' route arrays. Either:
  - Exclude the sensor from recorder via `recorder.exclude` config
  - Surface only the most recent trip's `route[]`; older trips summary-only
  - Strip route arrays before storing; load on-demand via a service call

## HACS submission

Project is NOT yet a git repo (per [feedback_git_virtiofs.md](memory) — no `git init` in existing dirs without coordination). Steps when ready:

- [ ] `git init` + initial commit. Preferred: from VM 104 via `qm guest exec` to avoid VirtioFS root-ownership issues, then GitHub remote.
- [ ] **Repository hygiene**: README screenshots + GIF demo (have most), LICENSE (have), CHANGELOG.
- [ ] **`info.md`** for HACS frontmatter.
- [ ] **GitHub release tag** + tagged builds.
- [ ] **HACS validation workflow** (hassfest-style).
- [ ] **HACS default repo PR**. (Optional — works fine as a custom repo too.)

## Dev workflow polish

- [ ] **Deploy script** — wrap the chunked-transfer SSH dance in `scripts/deploy-to-ha.sh` so `npm run deploy` is one command (and bumps `?v=N` on the resource record).
- [ ] **Hot-reload to live HA** during dev. Currently: `npm run dev` (Vite, fixture only) OR `npm run build && deploy` (HA, slow). Nice-to-have.
- [ ] **Tests**. None right now. Worth adding for the normalisers (Strava → trip-shape transform in `scripts/strava-fixture.py:to_trip`) since that's where source-specific bugs will live.

## Open research questions

- [ ] **Behaviour `type` codes**. Toyota's behaviours[] entries have single-letter type codes; sample data showed `"A"` and `"B"`. Hypothesis: A=acceleration, B=braking. Need more samples to confirm and to enumerate other types.
- [ ] **Behaviour `coachingMsg` / `diagnosticMsg` integers**. Probably map to localised strings somewhere in the EU APK. Worth grepping the jadx output.
- [ ] **`mode` per route point**. Observed values 0 and 1 in sample data. RAV4 PHEV. Hypothesis: 0=eco/EV, 1=power/blended. Verify with more samples once the smart-strategy soak finishes.
- [ ] **`getGridOptions()` for sections layout**. The card has a natural aspect ratio (top row + map + stats). Worth declaring `min_rows`/`min_columns` once we know what actually looks good.

## When picking this back up

Read in order:
1. **Top of this file** — "Status snapshot" tells you exactly where the session paused.
2. `docs/learnings.md` (one-pass refresher on the load-bearing patterns; now includes the visual-editor section)
3. `TODO.md` (rest of this file — pick a track)
4. `src/card.ts` and `src/editor/editor.ts` to remember where things live

**Three strong next-step candidates, ordered by quickest-feedback:**

1. **Verify visual editor in real HA dialog** (~15 min). Open `lovelace-playground/journey-strava` → edit dashboard → click pencil on the card → confirm every sub-panel renders with working pickers. If it works, mark the editor truly done. If it doesn't, the bug will be obvious within 1-2 iterations.
2. **Multi-source view** (~30 min). Add a fourth view to the playground: one card with `sources: [{Toyota, ...}, {Strava, ...}]` and `fallback_fixture_url` for both via a small loader change. Validates the headline feature.
3. **Patch `strava-fixture.py` for headless** (~20 min). Add `--code` flag and stdin-paste mode. Useful next time we run it.
