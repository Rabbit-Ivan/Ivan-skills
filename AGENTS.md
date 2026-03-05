# Repository Guidelines

## 项目概述
Ivan 的 Claude Code skill 管理中心（`Rabbit-Ivan/Ivan-skills`）。32 个 skill，654 文件，纯内容仓库。

## 安装
```bash
npx skills add https://github.com/Rabbit-Ivan/Ivan-skills/tree/main/skills            # 交互选择
npx -y skills add https://github.com/Rabbit-Ivan/Ivan-skills/tree/main/skills --all --global  # 全量安装
npx -y skills add https://github.com/Rabbit-Ivan/Ivan-skills/tree/main/skills --list          # 查看列表
npx -y skills add https://github.com/Rabbit-Ivan/Ivan-skills/tree/main/skills/pdf --global    # 安装单个 skill
```
可选环境变量：`GITHUB_TOKEN`（受限网络）、`HTTPS_PROXY` / `HTTP_PROXY`（代理）。

## 目录结构
```
skills/<name>/
├── SKILL.md           # 必需，skill 入口
├── references/        # 可选，参考资料
├── scripts/           # 可选，辅助脚本（Python/Node/Shell）
└── assets/            # 可选，资源文件
```
无 Web 应用、无 API、无 CI/CD、无 linter/formatter 配置。

### 非标准子目录（部分 skill 特有）
- `ooxml/`：docx、pptx 共享的 OOXML 模板与脚本
- `data/`：ui-ux-pro-max 的设计数据集
- `agents/`：cli-upgrade、static-residential-ip-assessor 的子 agent 配置
- `themes/`：theme-factory 的预设主题
- `canvas-fonts/`：canvas-design 的字体文件（占 83 文件大部分）
- `templates/`：planning-with-files 的计划模板

## Skill 复杂度速查
高复杂度（>50 文件，含脚本/OOXML）：
- `docx`（59 文件）— Word 文档处理，ooxml/ + scripts/，SKILL.md 含严格反模式规则
- `pptx`（56 文件）— PPT 处理，ooxml/ + scripts/，与 docx 共享 OOXML 模式
- `canvas-design`（83 文件）— 视觉创作，大量字体资源

中复杂度（10-50 文件或大型 SKILL.md）：
- `ui-ux-pro-max`（22 文件）— 设计智库，data/ + scripts/
- `pdf`（12 文件）— PDF 处理，scripts/
- `seo-review`（951 行 SKILL.md）— SEO 审核，最大单文件
- `landing-page-guide-v2`（794 行）— 落地页设计指南
- `json-canvas`（643 行）— Obsidian Canvas 格式
- `obsidian-markdown`（621 行）— Obsidian 语法
- `obsidian-bases`（619 行）— Obsidian 库视图

低复杂度（<10 文件，标准结构）：其余 22 个 skill。

## 外部来源 Skill（.skill-lock.json 追踪）
5 个 skill 从外部仓库安装，修改前确认来源：
- `find-skills`、`planning-with-files`、`markitdown`、`frontend-slides`、`.agents`

## 跨 Skill 关联
- docx ↔ pptx：共享 OOXML 脚本模式，修改 ooxml/ 时两者都需验证
- markitdown：引用其他 skill 能力（PDF/DOCX 转换）
- theme-factory：为其他输出型 skill（slides/docx/pptx）提供主题
- ui-ux-pro-max 有中英双语版本（同名 skill，不同 description 语言）

## 维护规范
- 目录名统一 kebab-case
- 每个 skill 必须含 `SKILL.md`
- 分支流程：`feature/*` → PR → `main`
- 禁止提交：`.DS_Store`、`__pycache__/`、`*.pyc`、`skills_backup_20260214/`

## Skill 文档中的关键反模式（跨 skill 通用）
- NEVER use unicode bullets in OOXML（docx/pptx）
- NEVER use `\n` for line breaks in XML content（docx）
- NEVER use `#` prefix for hex colors in OOXML（pptx）
- DO NOT use generic AI patterns / "AI slop"（frontend-design、benzenith-frontend-design）
- 注释一律用英文，代码中文注释是反模式

## 技术栈
- 主体：Markdown 文档
- 脚本：Python（xlsx recalc、pdf 处理）、Node.js（docx/pptx OOXML）、Shell
- 分发：`npx skills add` 从 GitHub 仓库
- 无 package.json / requirements.txt — 脚本依赖在各 skill SKILL.md 中说明

## 新增 Skill 检查清单
1. `skills/<kebab-case-name>/SKILL.md` 已创建
2. SKILL.md 含 description 字段（供 skill 列表展示）
3. 脚本放 `scripts/`，参考资料放 `references/`，资源放 `assets/`
4. 如有外部依赖，在 SKILL.md 中明确说明
5. 如与现有 skill 有关联（如共享 ooxml 模式），在两边文档中注明
