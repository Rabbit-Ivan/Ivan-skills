#!/usr/bin/env python3
import argparse
from pathlib import Path

from fetch_releases import fetch_release_window
from resolve_source import resolve_target
from summarize_changes import build_highlights, render_json, render_markdown


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Compare latest stable release with previous three stable releases.")
    parser.add_argument("--tool", required=True, help="Tool or app name, for example: codex")
    parser.add_argument("--repo-url", help="Official repository URL")
    parser.add_argument("--official-url", help="Official website or package page URL")
    parser.add_argument("--current-version", help="Current installed version")
    parser.add_argument("--output", choices=["markdown", "json"], default="markdown")
    parser.add_argument(
        "--registry",
        default=str(Path(__file__).resolve().parents[1] / "references" / "provider_registry.yaml"),
        help="Provider registry path",
    )
    return parser.parse_args()


def build_sources(source: dict, release_rows: list[dict]) -> list[dict]:
    rows = []
    if source.get("repo_url"):
        rows.append({"type": "repo", "url": source["repo_url"]})
    if source.get("official_url"):
        rows.append({"type": "official", "url": source["official_url"]})
    for item in release_rows:
        if item.get("url"):
            rows.append({"type": "release", "url": item["url"]})
    return rows


def main() -> int:
    args = parse_args()

    source = resolve_target(
        tool=args.tool,
        repo_url=args.repo_url,
        official_url=args.official_url,
        current_version=args.current_version,
        registry_path=args.registry,
    )

    release_window = fetch_release_window(source, count=4)
    release_rows = release_window.get("releases", [])

    result = {
        "tool": args.tool,
        "current_version": source.get("current_version"),
        "latest_stable": release_window.get("latest_stable"),
        "previous_stables": release_window.get("previous_stables", []),
        "highlights": build_highlights(release_rows),
        "sources": build_sources(source, release_rows),
        "confidence": source.get("confidence", "low"),
        "needs_user_input": source.get("needs_user_input", False),
        "message": source.get("message", ""),
    }

    if args.output == "json":
        print(render_json(result))
    else:
        print(render_markdown(result))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
