# Source Rules

## Priority

1. Explicit `repo_url`
2. Explicit `official_url`
3. Registry match (`provider_registry.yaml`)
4. Auto discovery from npm metadata
5. Ask user for official URL or GitHub repo URL

## Version Verification（关键）

**WebSearch 结果经常滞后，绝不能作为版本号的唯一来源。**

确认真实最新版本的优先级：
1. `npm view <package> versions --json`（npm 包，最可靠）
2. GitHub Releases 页面（WebFetch 抓取）
3. GitHub API: `https://api.github.com/repos/{owner}/{repo}/releases?per_page=10`
4. WebSearch（仅作辅助参考，不可作为唯一依据）

## Stable Version Filter

Exclude versions containing:
- alpha
- beta
- rc
- preview
- canary
- nightly

Case-insensitive matching is required.

## Source Types

| Type | Description | Key Fields |
|------|-------------|------------|
| `github` | GitHub Releases API | `repo_url` → `owner`/`repo` |
| `github_changelog` | Parse `CHANGELOG.md` from raw URL | `changelog_url`, `repo_url` |
| `npm` | npm registry | `package` |
| `pypi` | PyPI JSON API | `package` |

**注意**：对于高频发版的工具（如 Claude Code），优先使用 `github` 类型而非 `github_changelog`，因为 CHANGELOG.md 更新可能滞后且信息不如 Release 页面完整。

## Detail Fetching Strategy

确认版本号后，获取详细 release notes 的策略：
1. **GitHub Release 详情页**（WebFetch 抓取 `releases/tag/v{version}`）— 信息最完整
2. **GitHub Releases API** — 结构化数据，但可能被 rate limit
3. **CHANGELOG.md** — 备选方案

对于需要对比的 4 个版本，应**并行发出** WebFetch 请求。

## Failure Strategy

- Return partial results when possible.
- Explain missing pieces and next action.
- Never fabricate release notes.
