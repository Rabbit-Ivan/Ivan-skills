# Ivan-skills 迁移至 skills.sh 规范结构

## Context

用户有 29 个自定义 AI Agent Skills，目前散落在仓库根目录下，每次需要手动复制粘贴到各个 CLI/IDE 工具中。通过迁移为 skills.sh 开放标准的目录结构，用户和同事可以用 `npx skills add Rabbit-Ivan/Ivan-skills` 一键安装到 Claude Code、Codex、Cursor、Antigravity 等 37 个工具中。

## 实施步骤

### Step 1: 删除散落文件

- 删除 `doc-consistency.md`（散落的审核报告）
- 删除 `n8n-gen-skill/n8n AI Agent工作流设计提示词.md`（散落的中文文档）

### Step 2: 创建 `skills/` 目录，批量移动 29 个 skill

```bash
mkdir skills
git mv ast-grep-rule-crafter benzenith-frontend-design benzenith-frontend-design2 \
  brand-guidelines canvas-design clean-code-reviewer doc-coauthoring \
  doc-consistency-reviewer docx excel-analysis find-skills frontend-design \
  json-canvas kie-ai-generation landing-page-guide-v2 markitdown n8n-gen-skill \
  obsidian-bases obsidian-markdown pdf planning-with-files pptx product-manager \
  seo-review theme-factory ui-ux-pro-max wechat-article-writer xlsx \
  yt-dlp-downloader skills/
```

> SKILL.md 内部路径全部为相对路径，整体移动不影响，无需修改任何 SKILL.md 内部引用。

### Step 3: 修正 `excel-analysis` 的 name 字段

- 文件：`skills/excel-analysis/SKILL.md`
- 改动：frontmatter `name: Excel Analysis` → `name: excel-analysis`（统一 kebab-case）

### Step 4: 更新三个元文件

| 文件 | 改动内容 |
|------|---------|
| `CLAUDE.md` | 补充 `skills/` 子目录说明 |
| `AGENTS.md` | 更新 skill 目录路径描述（2 处） |
| `README.md` | 改动最大：新增安装说明、更新目录结构树、更新 License 路径前缀 |

**README.md 关键新增内容**：
```markdown
### 快速安装
npx skills add Rabbit-Ivan/Ivan-skills
```

### Step 5: 提交并推送

```
chore: 迁移至 skills.sh 规范目录结构

- 将 29 个 skill 目录从根目录移入 skills/ 子目录
- 修正 excel-analysis 的 name 字段为 kebab-case
- 删除散落文件：doc-consistency.md、n8n AI Agent工作流设计提示词.md
- 更新 README.md / CLAUDE.md / AGENTS.md 中的路径引用
- 适配 skills.sh 开放标准，支持 npx skills add 一键安装
```

### Step 6: 验证

```bash
# 结构验证
ls skills/ | wc -l   # 应输出 29

# 每个 skill 都有 SKILL.md
for d in skills/*/; do [ -f "$d/SKILL.md" ] || echo "MISSING: $d"; done

# npx 安装验证（push 后）
npx skills add Rabbit-Ivan/Ivan-skills --list
```

## 关键文件

- `README.md` — 改动最大
- `AGENTS.md` — 2 处路径更新
- `CLAUDE.md` — 轻微更新
- `excel-analysis/SKILL.md` — name 字段修正

## 风险评估

| 风险 | 应对 |
|------|------|
| git 历史丢失 | `git mv` 保留历史，`git log --follow` 可追溯 |
| SKILL.md 内部引用断裂 | 已验证全部为相对路径，不受影响 |
| canvas-fonts 大文件 | 暂不处理，未来如有体积问题可用 Git LFS |
| 本地已安装的 skills 失效 | 迁移后用 `npx skills add Rabbit-Ivan/Ivan-skills -g` 重新安装 |
