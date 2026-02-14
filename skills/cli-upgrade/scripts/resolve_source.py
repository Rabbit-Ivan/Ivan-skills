#!/usr/bin/env python3
import json
import re
import subprocess
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
from urllib.parse import urlparse

try:
    import yaml
except Exception:  # pragma: no cover
    yaml = None


VERSION_PATTERN = re.compile(r"v?\d+\.\d+\.\d+(?:[-+._a-zA-Z0-9]*)?")


def _run_command(args: list[str], timeout: int = 8) -> Tuple[int, str]:
    try:
        proc = subprocess.run(args, capture_output=True, text=True, timeout=timeout, check=False)
    except Exception:
        return 1, ""
    output = (proc.stdout or "") + (proc.stderr or "")
    return proc.returncode, output.strip()


def _extract_version(raw: str) -> Optional[str]:
    match = VERSION_PATTERN.search(raw)
    return match.group(0) if match else None


def detect_current_version(tool: str) -> Optional[str]:
    for args in ([tool, "--version"], [tool, "-V"], [tool, "version"]):
        code, output = _run_command(args)
        if code == 0 and output:
            version = _extract_version(output)
            if version:
                return version
    return None


def parse_github_repo(url: str) -> Optional[Dict[str, str]]:
    if not url:
        return None

    normalized = url.strip()
    if "github.com" not in normalized:
        return None

    if normalized.startswith("git@github.com:"):
        normalized = normalized.replace("git@github.com:", "https://github.com/")

    parsed = urlparse(normalized)
    path = parsed.path.strip("/")
    if not path:
        return None

    parts = path.split("/")
    if len(parts) < 2:
        return None

    owner = parts[0]
    repo = parts[1]
    if repo.endswith(".git"):
        repo = repo[:-4]

    if not owner or not repo:
        return None

    return {
        "owner": owner,
        "repo": repo,
        "repo_url": f"https://github.com/{owner}/{repo}",
    }


def _normalize_tool_key(tool: str) -> str:
    return tool.strip().lower()


def _load_registry(registry_path: Path) -> Dict[str, Dict[str, Any]]:
    if not registry_path.exists() or yaml is None:
        return {}

    data = yaml.safe_load(registry_path.read_text(encoding="utf-8")) or {}
    providers = data.get("providers", [])
    by_alias: Dict[str, Dict[str, Any]] = {}

    for provider in providers:
        aliases = provider.get("aliases", []) or []
        pid = provider.get("id")
        if pid:
            aliases = [pid, *aliases]
        for alias in aliases:
            by_alias[_normalize_tool_key(str(alias))] = provider

    return by_alias


def _npm_view_metadata(package_name: str) -> Optional[Dict[str, Any]]:
    code, output = _run_command([
        "npm",
        "view",
        package_name,
        "version",
        "repository.url",
        "homepage",
        "--json",
    ])
    if code != 0 or not output:
        return None

    try:
        payload = json.loads(output)
    except json.JSONDecodeError:
        return None

    if isinstance(payload, list):
        return None
    if not isinstance(payload, dict):
        return None

    if "version" not in payload:
        return None

    return payload


def resolve_target(
    tool: str,
    repo_url: Optional[str] = None,
    official_url: Optional[str] = None,
    current_version: Optional[str] = None,
    registry_path: Optional[str] = None,
) -> Dict[str, Any]:
    result: Dict[str, Any] = {
        "tool": tool,
        "current_version": current_version or detect_current_version(tool),
        "source_type": None,
        "repo_url": None,
        "owner": None,
        "repo": None,
        "npm_package": None,
        "pypi_package": None,
        "official_url": official_url,
        "confidence": "low",
        "needs_user_input": False,
        "message": "",
    }

    registry_file = Path(registry_path) if registry_path else None
    providers_by_alias = _load_registry(registry_file) if registry_file else {}

    direct_repo = parse_github_repo(repo_url or "")
    if direct_repo:
        result.update(
            {
                "source_type": "github",
                "repo_url": direct_repo["repo_url"],
                "owner": direct_repo["owner"],
                "repo": direct_repo["repo"],
                "confidence": "high",
                "official_url": official_url or direct_repo["repo_url"],
            }
        )
        return result

    if official_url:
        from_official = parse_github_repo(official_url)
        if from_official:
            result.update(
                {
                    "source_type": "github",
                    "repo_url": from_official["repo_url"],
                    "owner": from_official["owner"],
                    "repo": from_official["repo"],
                    "confidence": "high",
                }
            )
            return result

    provider = providers_by_alias.get(_normalize_tool_key(tool))
    if provider:
        provider_type = provider.get("source_type")
        if provider_type == "github" and provider.get("repo_url"):
            parsed = parse_github_repo(provider["repo_url"])
            if parsed:
                result.update(
                    {
                        "source_type": "github",
                        "repo_url": parsed["repo_url"],
                        "owner": parsed["owner"],
                        "repo": parsed["repo"],
                        "official_url": official_url or provider.get("official_url") or parsed["repo_url"],
                        "confidence": "high",
                    }
                )
                return result

        if provider_type == "npm" and provider.get("package"):
            result.update(
                {
                    "source_type": "npm",
                    "npm_package": provider.get("package"),
                    "official_url": official_url or provider.get("official_url"),
                    "confidence": "medium",
                }
            )
            return result

        if provider_type == "pypi" and provider.get("package"):
            result.update(
                {
                    "source_type": "pypi",
                    "pypi_package": provider.get("package"),
                    "official_url": official_url or provider.get("official_url"),
                    "confidence": "medium",
                }
            )
            return result

    npm_candidates = [tool]
    if tool == "codex":
        npm_candidates.insert(0, "@openai/codex")

    for package in npm_candidates:
        meta = _npm_view_metadata(package)
        if not meta:
            continue

        repo_candidate = meta.get("repository.url") or meta.get("repository")
        parsed = parse_github_repo(str(repo_candidate)) if repo_candidate else None
        if parsed:
            result.update(
                {
                    "source_type": "github",
                    "repo_url": parsed["repo_url"],
                    "owner": parsed["owner"],
                    "repo": parsed["repo"],
                    "npm_package": package,
                    "official_url": official_url or meta.get("homepage") or parsed["repo_url"],
                    "confidence": "medium",
                }
            )
            return result

        result.update(
            {
                "source_type": "npm",
                "npm_package": package,
                "official_url": official_url or meta.get("homepage") or f"https://www.npmjs.com/package/{package}",
                "confidence": "medium",
            }
        )
        return result

    result.update(
        {
            "needs_user_input": True,
            "message": "未能自动识别官方数据源。请提供官网 URL 或 GitHub 仓库 URL。",
        }
    )
    return result
