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

2. 确认真实最新版本（关键步骤，不可跳过）
- **绝对不要仅依赖 WebSearch 返回的版本号**，WebSearch 结果经常滞后。
- 对于 npm 包（如 Claude Code）：先用 `npm view <package> versions --json | tail -10` 获取真实版本列表。
- 对于 GitHub 项目：用 `WebFetch` 抓取 `https://github.com/{owner}/{repo}/releases` 页面确认最新版本。
- 两种方式互相印证，以实际 API/页面返回为准。

3. 解析数据源
- 优先用官方源：GitHub Releases、npm、PyPI。
- 自动解析失败时，明确要求用户补充官网或仓库 URL。

4. 拉取版本与发布说明
- 默认只看稳定版，过滤 `alpha`、`beta`、`rc`、`preview`、`canary`、`nightly`。
- 取 `最新稳定版 + 前 3 个稳定版`。
- **逐版本用 WebFetch 抓取 GitHub Release 详情页**（如 `https://github.com/{owner}/{repo}/releases/tag/v{version}`），获取完整 release notes。
- 四个版本的 WebFetch 请求应**并行发出**，提升效率。

5. 生成结果
- 先给一句话总览。
- 按版本用表格输出 2-4 条"你能感知到的变化"（分 新功能 / 体验优化 / 重要修复 / 性能 等类别）。
- 附上官方来源链接与发布日期。

## Output Format

使用以下格式输出：

```
# {tool} CLI 版本更新对比

> **最新稳定版：{version}**（{date} 发布）

## 一句话总览
{summary}

## {version}（最新 · {date}）
| 类别 | 你能感知到的变化 |
|------|-----------------|
| **新功能** | ... |
| **体验优化** | ... |
| **重要修复** | ... |

（每个版本重复上面的表格）

## 升级方式
{install commands}

Sources:
- [link1](url1)
- [link2](url2)
```

## Output Rules

- 保持大白话、短句、避免术语堆叠。
- 每个版本的表格控制在 2-4 行，只挑用户能直观感知的变化。
- 有数据就输出部分结果，并明确说明缺失原因。
- 对"当前版本识别失败"要显式提示，不阻断整体对比。

## Claude Code 特别注意事项

Claude Code 发版极快（几乎日更），是最容易出现版本滞后问题的工具：

1. **必须先用 npm 确认版本**：`npm view @anthropic-ai/claude-code versions --json | tail -10`
2. **GitHub Releases 是权威详情源**：每个版本都有独立的 Release 页面，内容比 CHANGELOG.md 更完整
3. **不要用 CHANGELOG.md**：更新可能不及时，且格式解析容易丢信息
4. **四个版本并行抓取**：`WebFetch` 四个 release tag 页面同时请求

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
