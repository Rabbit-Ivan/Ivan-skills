# Ivan Skills 集合

本仓库包含 **29 个自定义 Skills**，用于扩展 Claude Code 的能力。

## 📦 安装与同步

统一安装入口：

```bash
npx skills add Rabbit-Ivan/Ivan-skills
```

建议全量安装：

```bash
npx -y skills add Rabbit-Ivan/Ivan-skills --yes --global --all
```

查看可安装技能列表：

```bash
npx skills add Rabbit-Ivan/Ivan-skills --list
```

---

## 📊 Skills 概览

| 类别 | 数量 | 说明 |
|------|------|------|
| 文档处理 | 6 | Office 文档、PDF、Markdown 转换 |
| 前端开发 | 7 | 界面设计、落地页、UI/UX、品牌与视觉设计 |
| Obsidian | 3 | 笔记、Bases、Canvas |
| 代码质量 | 3 | 代码审查、AST 规则、文档一致性 |
| 内容创作 | 3 | 公众号、PRD、文档协作 |
| 工具集成 | 3 | Kie.ai、n8n、视频下载 |
| 其他 | 4 | SEO、主题样式、技能发现、任务规划 |

---

## 📝 文档处理

### docx
Word 文档创建、编辑和分析，支持修订追踪、批注、格式保留。

```
触发场景：创建/编辑 .docx 文件、添加批注、修订追踪
```

### pdf
PDF 全面操作工具包：文本提取、创建、合并拆分、表单处理。

```
触发场景：提取 PDF 文本、填写 PDF 表单、合并/拆分 PDF
```

### pptx
PowerPoint 演示文稿创建和编辑，支持布局模板、备注。

```
触发场景：创建/编辑演示文稿、添加演讲者备注
```

### xlsx
Excel 电子表格全面处理，支持公式、格式化、数据分析可视化。

```
触发场景：创建带公式的电子表格、数据分析、图表生成
```

### excel-analysis
Excel 数据分析专用，支持 pandas、数据透视表、matplotlib 可视化。

```
触发场景：分析 Excel 数据、创建数据透视表、生成图表
```

### markitdown
微软开发的多格式转 Markdown 工具，支持 15+ 格式。

```
支持格式：PDF、DOCX、PPTX、XLSX、图片(OCR)、音频(转录)、HTML、CSV、JSON、XML、ZIP、YouTube、EPub
触发场景：将各类文件转换为 Markdown
```

---

## 🎨 前端开发

### frontend-design
创建独特、高品质的前端界面，避免通用 AI 美学。

```
触发场景：构建 Web 组件、页面、仪表盘、React 组件、HTML/CSS 布局
特点：生产级代码、视觉冲击力、细节打磨
```

### landing-page-guide-v2
创建高转化率落地页，融合 11 个核心转化要素与卓越设计。

```
技术栈：Next.js 14+ / ShadCN UI / TypeScript
触发场景：营销页、产品页、促销网站
```

### ui-ux-pro-max
UI/UX 设计智能库，包含丰富的设计资源。

```
资源：50 种风格、21 种配色、50 组字体搭配、20 种图表
技术栈：React、Next.js、Vue、Svelte、SwiftUI、React Native、Flutter、Tailwind、Nuxt.js、Nuxt UI
```

### benzenith-frontend-design
BenZenith 品牌专用前端设计规范。

```
风格：东方极简 + 珠宝级质感 + 水墨肌理 + 黑金色系
触发场景：BenZenith 官网、落地页、电商页面
```

### benzenith-frontend-design2
BenZenith "设计稿范式复刻"专用版，固化 PC 端规范。

```
特点：PC 端尺寸规范、5 种页面模板、超大品牌签名 footer
页面类型：首页、系列页、单品页、品牌故事、展览页
```

### brand-guidelines
将 Anthropic 品牌色彩与字体规范应用到不同制品。

```
用途：品牌化视觉统一、文档/页面风格规范化
触发场景：品牌视觉规范、公司样式标准应用
```

### canvas-design
创建原创海报与静态视觉设计，输出 PNG/PDF。

```
触发场景：海报、视觉艺术、静态设计稿
特点：强调原创设计，避免照搬现有艺术家作品
```

---

## 📓 Obsidian 相关

### obsidian-markdown
创建和编辑 Obsidian 风格 Markdown。

```
支持语法：双链([[]])、嵌入(![[]])、Callout、Properties、标签
触发场景：处理 Obsidian 中的 .md 文件
```

### obsidian-bases
创建和编辑 Obsidian Bases（.base 文件）。

```
功能：视图、筛选器、公式、汇总
触发场景：创建笔记的数据库式视图、表格视图、卡片视图
```

### json-canvas
创建和编辑 JSON Canvas 文件（.canvas）。

```
功能：节点、边、分组、连接
触发场景：思维导图、流程图、可视化画布
```

---

## 🔍 代码质量

### clean-code-reviewer
基于《代码整洁之道》原则分析代码质量。

```
检查维度：命名、函数大小、重复、过度设计、魔法数字
输出：严重程度评级 + 重构建议
触发词：代码审查、代码体检、代码质量、重构检查
```

### ast-grep-rule-crafter
使用 ast-grep YAML 编写基于 AST 的代码搜索和重写规则。

```
用途：lint 规则、代码现代化迁移、API 迁移、自动修复
触发场景：tree-sitter 模式、代码搜索规则、批量重构
```

### doc-consistency-reviewer
检查代码实现与文档说明的一致性。

```
检查范围：README、docs/ 目录、API 文档、配置文档
输出：≥30 条问题项的一致性报告
触发词：文档审查、doc review、检查文档过时
```

---

## ✍️ 内容创作

### wechat-article-writer
公众号文章自动化写作流程。

```
流程：搜索资料 → 撰写文章 → 生成标题 → 排版优化
特点：故事化开头、爆款标题、1000-1500 字
触发词：写公众号、微信文章、自媒体写作、爆款文章
```

### product-manager
产品需求整合与 PRD 产出。

```
输入：需求文档、口述记录、图片、思维导图、录音转写
输出：按模板生成的 PRD 文档
特点：多格式输入整合、缺口澄清、冲突检测
```

### doc-coauthoring
结构化文档协作撰写工作流。

```
三阶段：上下文收集 → 优化与结构化 → 读者测试
适用：技术规格、提案、决策文档、RFC
```

---

## 🛠️ 工具集成

### kie-ai-generation
Kie.ai 视频/图片生成 API 集成。

```
工作流：创建任务 → 轮询/回调 → 解析结果
支持模型：Kling v2.1、Wan 2.2 A14B Turbo、Sora 2 Pro
技术栈：Next.js / Node / Flask
```

### n8n-gen-skill
通过研究官方模板生成 n8n 工作流。

```
流程：搜索模板 → 设计工作流 → 生成 JSON → 创建文档
输出：工作流 JSON + 需求文档
```

### yt-dlp-downloader
多平台视频下载工具。

```
支持平台：YouTube、Bilibili、Twitter、抖音等
默认质量：优先 4K（2160p），fallback 1080p
编码模式：H.264（默认）、HEVC/H.265、原始格式
特点：自动嵌入中文字幕
```

---

## 🎯 其他

### seo-review
JavaScript 概念页面专项 SEO 审核。

```
优化目标：搜索可见性、精选摘要、排名潜力
触发场景：发布前审核、优化表现不佳页面、内容审核
```

### theme-factory
为制品应用主题样式的工具包。

```
预设主题：10 种（含配色/字体）
适用制品：幻灯片、文档、报告、HTML 落地页
```

### find-skills
根据需求发现并安装可用 skill。

```
触发场景：询问“有没有 skill 能做 X”、扩展能力、安装新 skill
```

### planning-with-files
基于文件的复杂任务规划与会话恢复方案。

```
核心文件：task_plan.md、findings.md、progress.md
触发场景：多步骤任务、研究项目、长链路执行
```

---

## 🚀 使用方式

通过 `/skill-name` 调用对应技能：

```bash
# 前端开发
/frontend-design        # 创建前端界面
/landing-page-guide-v2  # 创建落地页
/ui-ux-pro-max          # UI/UX 设计
/benzenith-frontend-design
/benzenith-frontend-design2
/brand-guidelines
/canvas-design

# 文档处理
/docx                   # Word 文档
/pdf                    # PDF 处理
/pptx                   # PowerPoint
/xlsx                   # Excel 处理
/excel-analysis
/markitdown             # 格式转换

# 代码质量
/clean-code-reviewer    # 代码审查
/ast-grep-rule-crafter  # AST 规则
/doc-consistency-reviewer

# 内容创作
/wechat-article-writer  # 公众号文章
/product-manager        # PRD 文档
/doc-coauthoring

# 工具集成
/kie-ai-generation
/n8n-gen-skill
/yt-dlp-downloader      # 下载视频

# Obsidian
/obsidian-markdown
/obsidian-bases
/json-canvas

# 其他
/seo-review
/theme-factory
/find-skills
/planning-with-files
```

---

## 📁 目录结构

```text
Ivan-skills/
├── skills/
│   ├── ast-grep-rule-crafter/
│   ├── benzenith-frontend-design/
│   ├── benzenith-frontend-design2/
│   ├── brand-guidelines/
│   ├── canvas-design/
│   ├── clean-code-reviewer/
│   ├── doc-coauthoring/
│   ├── doc-consistency-reviewer/
│   ├── docx/
│   ├── excel-analysis/
│   ├── find-skills/
│   ├── frontend-design/
│   ├── json-canvas/
│   ├── kie-ai-generation/
│   ├── landing-page-guide-v2/
│   ├── markitdown/
│   ├── n8n-gen-skill/
│   ├── obsidian-bases/
│   ├── obsidian-markdown/
│   ├── pdf/
│   ├── planning-with-files/
│   ├── pptx/
│   ├── product-manager/
│   ├── seo-review/
│   ├── theme-factory/
│   ├── ui-ux-pro-max/
│   ├── wechat-article-writer/
│   ├── xlsx/
│   └── yt-dlp-downloader/
├── scripts/
│   ├── skills-manager.sh
│   └── skills-validate.sh
├── Makefile
├── README.md
├── CLAUDE.md
└── AGENTS.md
```

说明：
- 每个 skill 目录至少包含 `skills/<name>/SKILL.md`
- 常见子目录包括 `references/`、`assets/`、`themes/`、`scripts/`、`data/`、`templates/`、`ooxml/` 等

---

## 📄 License

以下 9 个 Skill 目录包含独立 `LICENSE.txt`：

- `skills/brand-guidelines/`
- `skills/canvas-design/`
- `skills/docx/`
- `skills/frontend-design/`
- `skills/markitdown/`
- `skills/pdf/`
- `skills/pptx/`
- `skills/theme-factory/`
- `skills/xlsx/`

其余 Skill 目录当前未单独放置许可证文件，请以对应来源或仓库整体约定为准。
