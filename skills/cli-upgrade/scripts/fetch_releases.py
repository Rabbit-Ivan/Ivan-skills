#!/usr/bin/env python3
import json
import re
import subprocess
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


STABLE_BLOCKLIST = ("alpha", "beta", "rc", "preview", "canary", "nightly")


def _fetch_json(url: str) -> Any:
    req = urllib.request.Request(url, headers={"User-Agent": "cli-upgrade-skill"})
    with urllib.request.urlopen(req, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def _is_stable_label(text: str) -> bool:
    lower = (text or "").lower()
    return not any(flag in lower for flag in STABLE_BLOCKLIST)


def _version_key(version: str):
    cleaned = version.strip().lstrip("v")
    parts = re.split(r"[.+\-]", cleaned)
    key = []
    for part in parts:
        if part.isdigit():
            key.append((0, int(part)))
        else:
            key.append((1, part))
    return tuple(key)


def _to_iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch_github_releases(owner: str, repo: str, count: int = 4) -> List[Dict[str, Any]]:
    url = f"https://api.github.com/repos/{owner}/{repo}/releases?per_page=100"
    try:
        payload = _fetch_json(url)
    except urllib.error.HTTPError:
        return []
    except urllib.error.URLError:
        return []

    releases: List[Dict[str, Any]] = []
    for item in payload:
        if item.get("draft"):
            continue

        tag = item.get("tag_name") or item.get("name") or ""
        if item.get("prerelease"):
            continue
        if not _is_stable_label(tag):
            continue

        releases.append(
            {
                "version": tag,
                "title": item.get("name") or tag,
                "published_at": item.get("published_at") or item.get("created_at"),
                "url": item.get("html_url"),
                "notes": item.get("body") or "",
                "source": "github",
            }
        )

        if len(releases) >= count:
            break

    return releases


def fetch_npm_releases(package_name: str, count: int = 4) -> List[Dict[str, Any]]:
    cmd = ["npm", "view", package_name, "versions", "time", "dist-tags", "--json"]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=20, check=False)
    except Exception:
        return []

    if proc.returncode != 0:
        return []

    try:
        payload = json.loads(proc.stdout)
    except json.JSONDecodeError:
        return []

    versions = payload.get("versions", []) if isinstance(payload, dict) else []
    times = payload.get("time", {}) if isinstance(payload, dict) else {}

    stable_versions = [v for v in versions if _is_stable_label(v)]

    def sort_key(v: str):
        ts = times.get(v)
        if ts:
            return (1, ts)
        return (0, _version_key(v))

    stable_versions.sort(key=sort_key, reverse=True)

    releases: List[Dict[str, Any]] = []
    for version in stable_versions[:count]:
        releases.append(
            {
                "version": version,
                "title": version,
                "published_at": times.get(version),
                "url": f"https://www.npmjs.com/package/{package_name}/v/{version}",
                "notes": "",
                "source": "npm",
            }
        )

    return releases


def fetch_pypi_releases(package_name: str, count: int = 4) -> List[Dict[str, Any]]:
    url = f"https://pypi.org/pypi/{package_name}/json"
    try:
        payload = _fetch_json(url)
    except urllib.error.HTTPError:
        return []
    except urllib.error.URLError:
        return []

    releases_raw = payload.get("releases", {})
    rows: List[Dict[str, Any]] = []

    for version, files in releases_raw.items():
        if not _is_stable_label(version):
            continue
        if not files:
            continue

        latest_time = None
        for file_info in files:
            upload = file_info.get("upload_time_iso_8601") or file_info.get("upload_time")
            if not upload:
                continue
            if upload.endswith("Z"):
                parsed = datetime.fromisoformat(upload.replace("Z", "+00:00"))
            else:
                parsed = datetime.fromisoformat(upload)
            if latest_time is None or parsed > latest_time:
                latest_time = parsed

        if latest_time is None:
            continue

        rows.append(
            {
                "version": version,
                "title": version,
                "published_at": _to_iso(latest_time),
                "url": f"https://pypi.org/project/{package_name}/{version}/",
                "notes": "",
                "source": "pypi",
            }
        )

    rows.sort(key=lambda x: x["published_at"], reverse=True)
    return rows[:count]


def fetch_release_window(source: Dict[str, Any], count: int = 4) -> Dict[str, Any]:
    source_type = source.get("source_type")
    releases: List[Dict[str, Any]] = []

    if source_type == "github" and source.get("owner") and source.get("repo"):
        releases = fetch_github_releases(source["owner"], source["repo"], count=count)
    elif source_type == "npm" and source.get("npm_package"):
        releases = fetch_npm_releases(source["npm_package"], count=count)
    elif source_type == "pypi" and source.get("pypi_package"):
        releases = fetch_pypi_releases(source["pypi_package"], count=count)

    latest = releases[0]["version"] if releases else None
    previous = [item["version"] for item in releases[1:4]]

    return {
        "latest_stable": latest,
        "previous_stables": previous,
        "releases": releases,
    }
