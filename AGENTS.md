# Repository Guidelines

## 项目概述
本仓库是 Ivan Skills 集合，集中存放 29 个 Claude Code Skills 的说明与参考资料。每个 Skill 以独立目录维护，核心入口为 `SKILL.md`。

## 项目结构与模块组织
- 根目录包含 `README.md`、`CLAUDE.md`、`AGENTS.md`、`Makefile`、`scripts/` 与 `skills/`。
- Skill 目录形如 `skills/<skill-name>/SKILL.md`。
- 常见子目录包含：`references/`、`assets/`、`themes/`、`scripts/`、`data/`、`templates/`、`ooxml/`、`canvas-fonts/`。
- 前后端结构、页面路由与 API 接口：本仓库不包含可运行的前后端服务，暂无页面路由与 API 接口定义。

## 安装、运行与构建
- 安装仓库：`git clone <repo>`，进入目录 `cd Ivan-skills`。
- 安装 Skills：`npx skills add Rabbit-Ivan/Ivan-skills`。
- 全量安装（推荐）：`npx -y skills add Rabbit-Ivan/Ivan-skills --yes --global --all`。
- 查看技能列表：`make skills-list`。
- 本地校验：`make skills-validate`。
- 从 `~/.agents/skills` 导入：`make skills-import`（可用 `DRY_RUN=1 make skills-import` 预览）。
- 环境变量（可选）：
  - `SKILLS_REPO`：覆盖默认仓库（默认 `Rabbit-Ivan/Ivan-skills`）。
  - `AGENTS_SKILLS_DIR`：覆盖导入源目录（默认 `~/.agents/skills`）。
  - `EXPECTED_SKILLS_COUNT`：覆盖校验期望数量（默认 `29`）。

## 开发规范与命名
- 文件以 Markdown 为主，标题使用 `#`/`##`，列表保持简洁。
- 目录命名采用小写加连字符（kebab-case），如 `wechat-article-writer/`；核心说明文件统一为 `SKILL.md`。
- `SKILL.md` 的 frontmatter `name` 应与目录名一致。
- 新增资料按用途放入 `references/`、`assets/`、`scripts/` 等目录，避免堆在根目录。

## 测试指南
- 仓库未配置统一测试框架与覆盖率门禁。
- 结构与命名校验使用：`make skills-validate`。
- 存在脚本级测试样例（如 `skills/pdf/scripts/check_bounding_boxes_test.py`），按对应 Skill 说明执行。

## 提交与 PR 指南
- 建议沿用“主题：说明”的中文提交格式。
- PR 请说明修改的 Skill 目录、更新的文档范围，并在需要时同步更新 `README.md`/`CLAUDE.md`。

## 技术栈与依赖
- 仓库本体以 Markdown 文档与 Shell 脚本为主。
- 分发依赖 `npx skills add`。
- 不同 Skill 可能使用 Python、Node.js、Shell/PowerShell 及第三方工具，具体以各自目录下文档为准。
