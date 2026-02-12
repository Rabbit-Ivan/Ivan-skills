# Repository Guidelines

## 项目概述
本仓库是 Ivan Skills 集合，集中存放 29 个 Claude Code Skills 的说明与参考资料。每个 Skill 以独立目录维护，核心入口为 `SKILL.md`。

## 项目结构与模块组织
- 根目录包含 `README.md`、`CLAUDE.md`、`AGENTS.md`。
- Skill 目录形如 `<skill-name>/SKILL.md`。
- 常见子目录包含：`references/`、`assets/`、`themes/`、`scripts/`、`data/`、`templates/`、`ooxml/`、`canvas-fonts/`。
- 前后端结构、页面路由与 API 接口：本仓库不包含可运行的前后端服务，暂无页面路由与 API 接口定义。

## 安装、运行与构建
- 安装：`git clone <repo>`，进入目录 `cd Ivan-skills`。
- 运行/构建：仓库无统一启动或构建命令，按各 Skill 文档运行对应脚本（如 Python、Shell、PowerShell、Node.js）。
- 环境变量：仓库本身无全局必填环境变量；如某 Skill 依赖环境变量，以对应 `SKILL.md` 说明为准。

## 开发规范与命名
- 文件以 Markdown 为主，标题使用 `#`/`##`，列表保持简洁。
- 目录命名采用小写加连字符，如 `wechat-article-writer/`；核心说明文件统一为 `SKILL.md`。
- 新增资料按用途放入 `references/`、`assets/`、`scripts/` 等目录，避免堆在根目录。

## 测试指南
- 仓库未配置统一测试框架与覆盖率门禁。
- 存在脚本级测试样例（如 `pdf/scripts/check_bounding_boxes_test.py`），按对应 Skill 说明执行。

## 提交与 PR 指南
- 建议沿用“主题：说明”的中文提交格式。
- PR 请说明修改的 Skill 目录、更新的文档范围，并在需要时同步更新 `README.md`/`CLAUDE.md`。

## 技术栈与依赖
- 仓库本体以 Markdown 文档为主，无统一运行时依赖。
- 不同 Skill 可能使用 Python、Node.js、Shell/PowerShell 及第三方工具，具体以各自目录下文档为准。
