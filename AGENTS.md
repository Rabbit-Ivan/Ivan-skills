# Repository Guidelines

## 项目概述
本仓库是 Ivan 的 skill 管理中心，用于集中维护 Claude Code skill。核心内容位于 `skills/`，每个 skill 独立目录管理。

## 安装、运行、构建
本仓库为 skill 内容仓库，不提供传统前后端运行服务。

- 安装 skills：`npx skills add Rabbit-Ivan/Ivan-skills`
- 全量安装：`npx -y skills add Rabbit-Ivan/Ivan-skills --yes --global --all`
- 查看列表：`npx skills add Rabbit-Ivan/Ivan-skills --list`

环境变量（可选）：
- `GITHUB_TOKEN`：在受限网络环境下访问 GitHub API 时可配置。
- `HTTPS_PROXY` / `HTTP_PROXY`：需要代理时配置。

## 项目结构、路由、API
- 目录结构：
  - `skills/<skill-name>/SKILL.md`：skill 入口说明。
  - `skills/<skill-name>/references/`：参考资料（可选）。
  - `skills/<skill-name>/scripts/`：辅助脚本（可选）。
  - `skills/<skill-name>/assets/`：资源文件（可选）。
- 前后端页面路由：无（本仓库不包含 Web 应用）。
- 项目 API 接口：无（本仓库不提供服务端 API）。

## 技术栈与依赖
- 主要内容：Markdown 文档、少量脚本资源。
- 分发方式：通过 `npx skills add` 从 GitHub 仓库安装。
- Skill 内可能依赖 Python / Node.js / Shell 工具，具体以各 skill 目录文档为准。

## 维护规范
- 目录名统一使用 kebab-case。
- 每个 skill 至少包含 `SKILL.md`。
- 默认流程使用 `feature/*` 分支 + PR 合并到 `main`。
- 不提交临时文件与缓存目录（例如 `.DS_Store`、`__pycache__/`、`*.pyc`、`skills_backup_20260214/`）。
