---
name: cli-upgrade
description: 通用版本升级对比助手。用于查询任意 CLI 或 App 的最新稳定版本，并与前 3 个稳定版本做更新对比，输出小白可读的大白话总结。适用于用户提到版本升级、release notes、changelog、更新亮点、对比前几个版本等场景；当数据源不明确时，要求用户补充官网或 GitHub 仓库 URL。
---

# CLI Upgrade

## Overview

- 识别目标工具（如 Codex、Claude Code、Opencode 或其他 CLI/App）。
- 查询最新稳定版与前 3 个稳定版，提炼主要更新并用大白话解释。

## Workflow

1. 收集输入
- 接收 `tool`（必填），可选 `repo_url`、`official_url`、`current_version`。
- 未提供 URL 时，先尝试自动解析数据源。

2. 解析数据源
- 优先用官方源：GitHub Releases、npm、PyPI。
- 自动解析失败时，明确要求用户补充官网或仓库 URL。

3. 拉取版本与发布说明
- 默认只看稳定版，过滤 `alpha`、`beta`、`rc`、`preview`、`canary`、`nightly`。
- 取 `最新稳定版 + 前 3 个稳定版`。

4. 生成结果
- 先给一句话总览。
- 按版本输出 2-4 条“你能感知到的变化”。
- 附上官方来源链接与发布日期。

## Output Rules

- 保持大白话、短句、避免术语堆叠。
- 有数据就输出部分结果，并明确说明缺失原因。
- 对“当前版本识别失败”要显式提示，不阻断整体对比。

## Scripts

- 使用 `scripts/compare_cli_versions.py` 作为统一入口。
- 需要扩展新的平台时，先改 `references/provider_registry.yaml`，再补 `resolve_source.py` 与 `fetch_releases.py`。

### Entry Command

```bash
python scripts/compare_cli_versions.py \
  --tool "codex" \
  --output markdown
```

### Optional Arguments

```bash
--repo-url "https://github.com/openai/codex"
--official-url "https://www.npmjs.com/package/@openai/codex"
--current-version "0.101.0"
--output "json"
```

## References

- `references/provider_registry.yaml`：工具名到官方源的映射。
- `references/source_rules.md`：数据源优先级与降级规则。
- `references/output_template.md`：大白话输出模板。
