#!/usr/bin/env python3
import json
import re
from typing import Any, Dict, List


TECH_TO_PLAIN = [
    (r"\bconcurr(?:ency|ent)\b", "同时处理多任务时更稳"),
    (r"\bmemory\b", "上下文记忆更干净、更不容易串内容"),
    (r"\bwebsocket\b", "实时连接更稳定"),
    (r"\bsandbox\b", "权限隔离和安全策略更明确"),
    (r"\bpackag(?:e|ing)\b", "安装和分发方式更省心"),
    (r"\brate limit\b", "高频调用时更不容易被限流打断"),
    (r"\bbreaking\b", "可能会影响旧用法，需要留意"),
    (r"\bfix(?:ed)?\b", "修了会影响体验的细节问题"),
]


def _clean_line(line: str) -> str:
    text = re.sub(r"`([^`]+)`", r"\1", line)
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _extract_bullets(notes: str, limit: int = 4) -> List[str]:
    if not notes:
        return []
    bullets: List[str] = []
    for raw in notes.splitlines():
        line = raw.strip()
        if not line.startswith(("- ", "* ")):
            continue
        item = _clean_line(line[2:])
        if not item:
            continue
        bullets.append(item)
        if len(bullets) >= limit:
            break
    return bullets


def _plainify(text: str) -> str:
    lower = text.lower()
    for pattern, replacement in TECH_TO_PLAIN:
        if re.search(pattern, lower):
            return f"{text}（简单说：{replacement}）"
    return text


def build_highlights(releases: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for release in releases:
        bullets = _extract_bullets(release.get("notes", ""), limit=4)
        if bullets:
            items = [_plainify(b) for b in bullets[:3]]
        else:
            published = release.get("published_at") or "未知日期"
            if release.get("source") == "github":
                items = [f"官方已发布该版本（{published}），但公开说明较少。"]
            else:
                items = [f"已检测到该稳定版本（{published}），建议配合官方发布页查看细节。"]

        rows.append(
            {
                "version": release.get("version"),
                "published_at": release.get("published_at"),
                "url": release.get("url"),
                "highlights": items,
            }
        )

    return rows


def render_markdown(result: Dict[str, Any]) -> str:
    tool = result.get("tool")
    current = result.get("current_version") or "未识别"
    latest = result.get("latest_stable") or "未获取"
    previous = result.get("previous_stables") or []
    previous_text = ", ".join(previous) if previous else "未获取"

    lines = [
        f"# {tool} 版本升级对比",
        "",
        f"- 当前版本：`{current}`",
        f"- 最新稳定版：`{latest}`",
        f"- 前三个稳定版：`{previous_text}`",
        "",
    ]

    if result.get("needs_user_input"):
        lines.extend(
            [
                "## 需要补充的信息",
                f"- {result.get('message')}",
                "",
            ]
        )

    lines.extend(
        [
            "## 大白话总结",
            f"- 这次最核心的变化是：围绕 `{latest}` 做的体验和稳定性优化，重点看下面每个版本的体感差异。",
            "",
            "## 版本要点",
        ]
    )

    for item in result.get("highlights", []):
        lines.append(f"- `{item['version']}`（{item.get('published_at') or '未知日期'}）")
        for point in item.get("highlights", []):
            lines.append(f"  - {point}")

    lines.extend(["", "## 官方来源"])

    seen = set()
    for src in result.get("sources", []):
        url = src.get("url")
        if not url or url in seen:
            continue
        seen.add(url)
        lines.append(f"- {url}")

    return "\n".join(lines) + "\n"


def render_json(result: Dict[str, Any]) -> str:
    return json.dumps(result, ensure_ascii=False, indent=2)
