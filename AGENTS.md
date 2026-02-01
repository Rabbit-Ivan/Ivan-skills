# Repository Guidelines

## 项目概述
本仓库是 Ivan Skills 集合，集中存放 25 个 Claude Code Skills 的说明与参考资料。每个 Skill 以独立目录维护，核心入口为 `SKILL.md`。

## 项目结构与模块组织
- 根目录包含 `README.md`、`CLAUDE.md`、`AGENTS.md`。
- Skill 目录形如 `<skill-name>/SKILL.md`，可选 `references/`、`assets/`、`themes/` 等子目录。
- 前后端结构、页面路由与 API 接口：本仓库不包含可运行服务，暂无路由与接口。

## 安装、运行与构建
- 安装：`git clone <repo>`，进入目录 `cd Ivan-skills`。
- 运行/构建：无可执行应用与构建流程，直接编辑 Markdown 即可。
- 环境变量：仓库本身不需要；如某 Skill 依赖环境变量，以对应 `SKILL.md` 说明为准。

## 开发规范与命名
- 文件以 Markdown 为主，标题使用 `#`/`##`，列表保持简洁。
- 目录命名采用小写加连字符，如 `wechat-article-writer/`；核心说明文件统一为 `SKILL.md`。
- 新增参考资料优先放入 `references/` 或 `assets/`。

## 测试指南
- 当前无自动化测试与覆盖率要求。

## 提交与 PR 指南
- 现有提交为 `init：初始化Ivan的skills`，建议沿用“主题：说明”的中文格式。
- PR 请说明修改的 Skill 目录、更新的文档范围，并在需要时同步更新 `README.md`/`CLAUDE.md`。

## 技术栈与依赖
- 仓库本身为文档仓库，无运行时依赖。
- 部分 Skill 在说明中引用 Node.js、Python 或第三方工具，仅作为使用指引。
