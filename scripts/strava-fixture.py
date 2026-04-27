#!/usr/bin/env python3
"""
Strava → journey-viewer-card fixture generator.

One-shot script that pulls your full Strava activity history (paginating past
the integration's 200-item / 10-exposed cap) and writes a fixture JSON file
matching the journey-viewer-card data contract.

Usage:
    ./scripts/strava-fixture.py
    ./scripts/strava-fixture.py --out strava-trips.json --detailed
    ./scripts/strava-fixture.py --since 2019-01-01

First run prompts for Strava API client_id / client_secret (create at
https://www.strava.com/settings/api — takes 30s). Stores tokens in
~/.config/strava-fixture.json for subsequent runs.

Stdlib only; no pip install required.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request
import webbrowser
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import Any

CONFIG_PATH = Path.home() / ".config" / "strava-fixture.json"
OAUTH_PORT = 8721  # arbitrary; unlikely to clash
OAUTH_REDIRECT = f"http://localhost:{OAUTH_PORT}/callback"
SCOPE = "read,activity:read_all"

API_BASE = "https://www.strava.com/api/v3"
TOKEN_URL = "https://www.strava.com/oauth/token"
AUTH_URL = "https://www.strava.com/oauth/authorize"


# ─── Polyline decoder (Google's encoded polyline algorithm) ──────────────────


def decode_polyline(encoded: str) -> list[tuple[float, float]]:
    """Decode a Google-encoded polyline string into [(lat, lon), ...]."""
    if not encoded:
        return []
    coords: list[tuple[float, float]] = []
    i = 0
    lat = lon = 0
    while i < len(encoded):
        for j in range(2):
            shift = result = 0
            while True:
                b = ord(encoded[i]) - 63
                i += 1
                result |= (b & 0x1F) << shift
                shift += 5
                if b < 0x20:
                    break
            delta = ~(result >> 1) if (result & 1) else (result >> 1)
            if j == 0:
                lat += delta
            else:
                lon += delta
        coords.append((lat / 1e5, lon / 1e5))
    return coords


# ─── HTTP helpers (stdlib) ───────────────────────────────────────────────────


def http_post(url: str, data: dict[str, Any]) -> dict[str, Any]:
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def http_get(url: str, token: str) -> Any:
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


# ─── OAuth: localhost-redirect flow ──────────────────────────────────────────


class _CodeCatcher(BaseHTTPRequestHandler):
    code: str | None = None

    def do_GET(self):  # noqa: N802 (stdlib API)
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        _CodeCatcher.code = params.get("code", [None])[0]
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.wfile.write(
            b"<html><body><h2>OK, you can close this tab.</h2></body></html>"
        )

    def log_message(self, *_args, **_kwargs):  # silence stdout
        return


def oauth_initial(client_id: str, client_secret: str) -> dict[str, Any]:
    """First-time auth: open browser, catch redirect, exchange code for tokens."""
    auth_qs = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "redirect_uri": OAUTH_REDIRECT,
            "response_type": "code",
            "approval_prompt": "auto",
            "scope": SCOPE,
        }
    )
    url = f"{AUTH_URL}?{auth_qs}"
    print(f"\nOpening browser for Strava auth.\nIf nothing opens, visit:\n  {url}\n")
    webbrowser.open(url)

    server = HTTPServer(("localhost", OAUTH_PORT), _CodeCatcher)
    while _CodeCatcher.code is None:
        server.handle_request()
    code = _CodeCatcher.code

    tokens = http_post(
        TOKEN_URL,
        {
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
        },
    )
    return tokens


def oauth_refresh(
    client_id: str, client_secret: str, refresh_token: str
) -> dict[str, Any]:
    return http_post(
        TOKEN_URL,
        {
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        },
    )


def load_config() -> dict[str, Any]:
    if not CONFIG_PATH.exists():
        return {}
    return json.loads(CONFIG_PATH.read_text())


def save_config(cfg: dict[str, Any]) -> None:
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    CONFIG_PATH.write_text(json.dumps(cfg, indent=2))
    os.chmod(CONFIG_PATH, 0o600)


def get_access_token() -> str:
    cfg = load_config()

    if "client_id" not in cfg or "client_secret" not in cfg:
        print("\nFirst-run setup. Create a Strava API app at:")
        print("  https://www.strava.com/settings/api")
        print("Set the Authorization Callback Domain to: localhost\n")
        cfg["client_id"] = input("client_id: ").strip()
        cfg["client_secret"] = input("client_secret: ").strip()
        save_config(cfg)

    if "refresh_token" not in cfg:
        tokens = oauth_initial(cfg["client_id"], cfg["client_secret"])
        cfg["refresh_token"] = tokens["refresh_token"]
        cfg["access_token"] = tokens["access_token"]
        cfg["expires_at"] = tokens["expires_at"]
        save_config(cfg)
        return cfg["access_token"]

    if cfg.get("expires_at", 0) > time.time() + 60:
        return cfg["access_token"]

    tokens = oauth_refresh(
        cfg["client_id"], cfg["client_secret"], cfg["refresh_token"]
    )
    cfg["refresh_token"] = tokens["refresh_token"]
    cfg["access_token"] = tokens["access_token"]
    cfg["expires_at"] = tokens["expires_at"]
    save_config(cfg)
    return cfg["access_token"]


# ─── Activity fetch + transform ──────────────────────────────────────────────


SPORT_TYPE_MAP = {
    "Ride": "ride",
    "VirtualRide": "ride",
    "EBikeRide": "ride",
    "GravelRide": "ride",
    "MountainBikeRide": "ride",
    "Run": "run",
    "TrailRun": "run",
    "VirtualRun": "run",
    "Hike": "hike",
    "Walk": "hike",
    "AlpineSki": "ski",
    "BackcountrySki": "ski",
    "NordicSki": "ski",
}


def fetch_all_activities(
    token: str, since: int | None = None
) -> list[dict[str, Any]]:
    """Page through /athlete/activities until exhausted."""
    out: list[dict[str, Any]] = []
    page = 1
    while True:
        qs = {"per_page": 200, "page": page}
        if since is not None:
            qs["after"] = since
        url = f"{API_BASE}/athlete/activities?{urllib.parse.urlencode(qs)}"
        batch = http_get(url, token)
        if not batch:
            break
        out.extend(batch)
        print(f"  page {page}: +{len(batch)}  (total {len(out)})")
        if len(batch) < 200:
            break
        page += 1
    return out


def fetch_activity_detail(token: str, activity_id: int) -> dict[str, Any]:
    """Fetch full activity to get the high-fidelity `map.polyline`."""
    url = f"{API_BASE}/activities/{activity_id}"
    return http_get(url, token)


def to_iso(epoch_or_iso: Any) -> str | None:
    if epoch_or_iso is None:
        return None
    if isinstance(epoch_or_iso, str):
        return epoch_or_iso
    return datetime.fromtimestamp(epoch_or_iso, tz=timezone.utc).isoformat()


def end_ts_from(start_iso: str, elapsed_s: int) -> str:
    dt = datetime.fromisoformat(start_iso.replace("Z", "+00:00"))
    end = datetime.fromtimestamp(dt.timestamp() + elapsed_s, tz=timezone.utc)
    return end.isoformat()


def to_trip(act: dict[str, Any], polyline: str) -> dict[str, Any] | None:
    """Map a Strava activity dict to the journey-viewer-card Trip shape."""
    coords = decode_polyline(polyline)
    if not coords:
        return None  # no map data — skip (older app entries, treadmill runs)

    start_ll = act.get("start_latlng") or list(coords[0])
    end_ll = act.get("end_latlng") or list(coords[-1])
    start_iso = to_iso(act.get("start_date"))
    if not start_iso:
        return None
    elapsed = int(act.get("elapsed_time") or 0)

    moving = int(act.get("moving_time") or 0)
    avg = act.get("average_speed")  # m/s
    mx = act.get("max_speed")  # m/s

    sport = act.get("sport_type") or act.get("type")
    activity_type = SPORT_TYPE_MAP.get(sport, "other")

    return {
        "id": str(act["id"]),
        "label": act.get("name"),
        "source": "strava",
        "activity_type": activity_type,
        "start_ts": start_iso,
        "end_ts": end_ts_from(start_iso, elapsed),
        "start": {"lat": start_ll[0], "lon": start_ll[1]},
        "end": {"lat": end_ll[0], "lon": end_ll[1]},
        "route": [{"lat": lat, "lon": lon} for lat, lon in coords],
        "stats": {
            "distance_m": int(act.get("distance") or 0),
            "duration_s": elapsed,
            "duration_idle_s": max(0, elapsed - moving) if moving else None,
            "average_speed_kmh": round(avg * 3.6, 1) if avg is not None else None,
            "max_speed_kmh": round(mx * 3.6, 1) if mx is not None else None,
        },
        "scores": None,
        "behaviours": None,
    }


# ─── Main ────────────────────────────────────────────────────────────────────


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument(
        "--out",
        default="strava-trips.json",
        help="output path (default: strava-trips.json)",
    )
    parser.add_argument(
        "--since",
        help="ISO date or YYYY-MM-DD; only activities on/after this date",
    )
    parser.add_argument(
        "--detailed",
        action="store_true",
        help="fetch full polyline per activity (1 extra API call each, "
        "richer route data; respect rate limits)",
    )
    args = parser.parse_args()

    since_epoch = None
    if args.since:
        dt = datetime.fromisoformat(args.since.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        since_epoch = int(dt.timestamp())

    print("Authenticating ...")
    token = get_access_token()

    print("Fetching activity list ...")
    activities = fetch_all_activities(token, since=since_epoch)
    print(f"Got {len(activities)} activities total.")

    trips: list[dict[str, Any]] = []
    skipped_no_map = 0
    for i, act in enumerate(activities, 1):
        polyline = (act.get("map") or {}).get("summary_polyline") or ""
        if args.detailed and act.get("id"):
            print(f"  detail {i}/{len(activities)}: {act.get('name', '?')}")
            try:
                detail = fetch_activity_detail(token, act["id"])
                polyline = (detail.get("map") or {}).get("polyline") or polyline
                # 100 req/15min — be polite
                time.sleep(0.2)
            except Exception as err:  # rate limit, network, etc.
                print(f"    detail fetch failed ({err}); using summary_polyline")

        trip = to_trip(act, polyline)
        if trip:
            trips.append(trip)
        else:
            skipped_no_map += 1

    print(f"\n{len(trips)} trips with map data, {skipped_no_map} skipped (no GPS).")

    out_path = Path(args.out)
    if not out_path.is_absolute():
        # Resolve relative to script's project root, not cwd.
        out_path = Path(__file__).resolve().parent.parent / out_path
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # Write in card-fixture order: newest-first matches the card's default.
    trips.sort(key=lambda t: t.get("start_ts") or "", reverse=True)
    out_path.write_text(json.dumps(trips, indent=2))
    print(f"Wrote {out_path} ({out_path.stat().st_size:,} bytes).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
