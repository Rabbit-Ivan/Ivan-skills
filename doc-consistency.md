# 文档一致性审核报告

**审核时间**: 2026-02-12
**审核范围**: Ivan Skills 集合 — README.md、CLAUDE.md、AGENTS.md、29 个 SKILL.md 及全部子目录
**审核原则**: 以代码/文件系统为真

---

## 审核结论

- **结论**: 通过（基于当前工作区修复结果）
- **汇总**: P0:0 P1:0 P2:0 P3:0 待补充:0
- **修复优先级**: 已完成本轮高/中/低优先级修复

## 修复状态同步（2026-02-12）

> 说明：以下状态基于当前工作区文件，未包含是否已提交到 Git 历史。

### 已修复（30 项）

- #1–#27
- #30–#32

### 已确认无需修复或误报（2 项）

- #28：`README.md` 与 `markitdown/SKILL.md` 对“微软开发”的描述一致，不构成功能不一致。
- #29：`theme-factory/SKILL.md` 已引用 `theme-showcase.pdf`，该项为误报。

### 待处理（0 项）

- 无

---

## P0 — 安全问题/严重误导

### 1. markitdown SKILL.md 引用不存在的脚本和技能
- **严重级别**: P0
- **位置**: `markitdown/SKILL.md:23-54`
- **证据**:
  - 文档: 第 28 行声明使用 `scientific-schematics` skill；第 36 行声明运行 `python scripts/generate_schematic.py`；第 43 行声明输出到 `figures/` 目录
  - 代码: `scripts/generate_schematic.py` 不存在于 `markitdown/scripts/` 目录中；`figures/` 目录不存在；项目中无 `scientific-schematics` skill（不在 29 个 skill 目录中，也不在系统注册列表中）
- **影响**: 用户按文档操作会直接报错 `FileNotFoundError`，且被误导去调用一个完全不存在的 skill
- **建议**: 删除整个 "Visual Enhancement with Scientific Schematics" 章节（第 23-54 行），或在该 skill 实际可用后再添加
- **关联原则**: 以代码为真

---

## P1 — 核心功能不一致

### 2. ui-ux-pro-max 脚本路径全部错误
- **严重级别**: P1
- **位置**: `ui-ux-pro-max/SKILL.md:54,73,118,121,124,127,130,133,134,137`
- **证据**:
  - 文档: 10 处使用路径 `.codex/scripts/search.py`（如第 54 行 `python3 .codex/scripts/search.py "<keyword>"...`）
  - 代码: 实际路径为 `scripts/search.py`，`.codex/` 前缀不存在
- **影响**: 按文档执行命令将全部报错，skill 核心搜索功能无法使用
- **建议**: 将所有 `.codex/scripts/search.py` 替换为 `scripts/search.py`
- **关联原则**: 以代码为真

### 3. README.md 声称 25 个 Skills，实际存在 29 个
- **严重级别**: P1
- **位置**: `README.md:3,9-17`
- **证据**:
  - 文档: "本仓库包含 **25 个自定义 Skills**"，概览表汇总也为 25
  - 代码: 实际有 29 个含 SKILL.md 的目录。以下 4 个 skill 有目录但 README 完全未提及：
    - `brand-guidelines/`
    - `canvas-design/`
    - `find-skills/`
    - `planning-with-files/`
- **影响**: 用户无法从 README 发现这 4 个可用的 skill
- **建议**: 将数量更新为 29，并在对应分类下添加这 4 个 skill 的说明
- **关联原则**: 以代码为真

### 4. CLAUDE.md 同样遗漏 4 个 Skills
- **严重级别**: P1
- **位置**: `CLAUDE.md:3`
- **证据**:
  - 文档: "本目录包含 25 个自定义 Skills"，列表缺少 `brand-guidelines`、`canvas-design`、`find-skills`、`planning-with-files`
  - 代码: 同上，实际 29 个
- **影响**: Claude 加载项目指令时获得不完整的 skill 列表
- **建议**: 与 README.md 同步更新
- **关联原则**: 以代码为真

### 5. n8n-gen-skill SKILL.md 引用缺失的必需输入文件
- **严重级别**: P1
- **位置**: `n8n-gen-skill/SKILL.md:42-45,92`
- **证据**:
  - 文档: 第 42-45 行 "Read the specific design prompt file: `n8n AI Agent工作流设计提示词.md`"；第 92 行标注为 `(Required Input)`
  - 代码: `n8n-gen-skill/` 目录下仅有 `SKILL.md` 和 `Readme.md`，该文件不存在
- **影响**: skill 工作流步骤 3 无法执行
- **建议**: 将该文件添加到目录中，或注明其获取方式
- **关联原则**: 以代码为真

### 6. n8n-gen-skill frontmatter name 与目录名不一致
- **严重级别**: P1
- **位置**: `n8n-gen-skill/SKILL.md:2`
- **证据**:
  - 文档: frontmatter `name: n8n-gen`
  - 代码: 目录名为 `n8n-gen-skill`；CLAUDE.md 列表名为 `n8n-gen-skill`；系统注册名为 `n8n-gen-skill`
- **影响**: 可能导致 skill 查找/匹配失败
- **建议**: 将 frontmatter name 更新为 `n8n-gen-skill`
- **关联原则**: 合同优先

### 7. README.md 目录结构遗漏大量实际子目录和文件
- **严重级别**: P1
- **位置**: `README.md:284-354`
- **证据**:
  - 文档: 目录结构树中多个 skill 仅显示 `SKILL.md`
  - 代码: 实际遗漏的内容：
    - `docx/` 缺少 `scripts/`、`ooxml/`（含 schemas/、scripts/）、`LICENSE.txt`
    - `pptx/` 缺少 `scripts/`、`ooxml/`、`LICENSE.txt`
    - `xlsx/` 缺少 `recalc.py`、`LICENSE.txt`
    - `pdf/` 缺少 `scripts/`、`LICENSE.txt`
    - `ui-ux-pro-max/` 缺少 `scripts/`、`data/`
    - `markitdown/` 缺少 `scripts/`、`INSTALLATION_GUIDE.md` 等多个文件
    - `brand-guidelines/`、`canvas-design/`、`find-skills/`、`planning-with-files/` 整个目录缺失
    - `yt-dlp-downloader/` 整个目录缺失
- **影响**: 开发者无法从 README 了解项目真实结构
- **建议**: 更新目录结构树以反映实际状态，或简化为仅列出顶层目录
- **关联原则**: 以代码为真

### 8. AGENTS.md 声称无脚本/可执行文件，与实际不符
- **严重级别**: P1
- **位置**: `AGENTS.md:13,22`
- **证据**:
  - 文档: "运行/构建：无可执行应用与构建流程"、"当前无自动化测试与覆盖率要求"
  - 代码: 仓库包含 37 个 Python 脚本、2 个 Shell 脚本、2 个 PowerShell 脚本、1 个 JavaScript 文件；`pdf/scripts/check_bounding_boxes_test.py` 是一个测试文件
- **影响**: 误导贡献者认为仓库是纯文档仓库
- **建议**: 更新描述以反映仓库包含可执行脚本
- **关联原则**: 以代码为真

---

## P2 — 示例不完整/命名不一致

### 9. ui-ux-pro-max 文档遗漏 2 个 stack
- **严重级别**: P2
- **位置**: `ui-ux-pro-max/SKILL.md:76`
- **证据**:
  - 文档: Available Stacks 表格列出 8 个 stack
  - 代码: `data/stacks/` 下实际有 10 个 CSV：多出 `nuxtjs.csv` 和 `nuxt-ui.csv`
- **影响**: 用户不知道可以搜索 Nuxt.js 和 Nuxt UI 相关内容
- **建议**: 在 Available Stacks 表中添加 `nuxtjs` 和 `nuxt-ui`
- **关联原则**: 以代码为真

### 10. ui-ux-pro-max description 声称 8 个技术栈，实际 10 个
- **严重级别**: P2
- **位置**: `ui-ux-pro-max/SKILL.md:3`
- **证据**:
  - 文档: description 中 "8 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind)"
  - 代码: 同 #9，实际支持 10 个
- **影响**: 与实际能力描述不符
- **建议**: 更新为 "10 stacks" 并添加 Nuxt.js 和 Nuxt UI
- **关联原则**: 以代码为真

### 11. README.md 中 ui-ux-pro-max 技术栈列表与实际不符
- **严重级别**: P2
- **位置**: `README.md:91`
- **证据**:
  - 文档: "技术栈：React、Next.js、Vue、Svelte、SwiftUI、React Native、Flutter、Tailwind"（8 个）
  - 代码: 同 #9，实际 10 个
- **影响**: README 描述与实际能力不一致
- **建议**: 同步更新
- **关联原则**: 以代码为真

### 12. planning-with-files SKILL.md 遗漏 PowerShell 脚本
- **严重级别**: P2
- **位置**: `planning-with-files/SKILL.md:227-231`
- **证据**:
  - 文档: Scripts 章节仅列出 `init-session.sh`、`check-complete.sh`、`session-catchup.py`
  - 代码: `scripts/` 目录还存在 `init-session.ps1` 和 `check-complete.ps1`
- **影响**: Windows 用户不知道有 PowerShell 版本可用
- **建议**: 在 Scripts 章节中添加 PowerShell 脚本说明
- **关联原则**: 以代码为真

### 13. markitdown SKILL.md 未在文档中提及 convert_literature.py 脚本
- **严重级别**: P2
- **位置**: `markitdown/SKILL.md`
- **证据**:
  - 文档: 仅在第 474-475 行提及 `batch_convert.py` 和 `convert_with_ai.py`
  - 代码: `scripts/` 目录下还存在 `convert_literature.py`，完全未被提及
- **影响**: 用户不知道有学术文献转换脚本可用
- **建议**: 在文档中添加 `convert_literature.py` 的说明
- **关联原则**: 以代码为真

### 14. markitdown 有多个独立文档文件未在 SKILL.md 中索引
- **严重级别**: P2
- **位置**: `markitdown/SKILL.md`
- **证据**:
  - 文档: SKILL.md 未提及以下文件的存在
  - 代码: 目录下存在 `INSTALLATION_GUIDE.md`、`OPENROUTER_INTEGRATION.md`、`QUICK_REFERENCE.md`、`SKILL_SUMMARY.md`、`assets/example_usage.md`
- **影响**: 用户可能遗漏有用的安装指南和快速参考
- **建议**: 在 SKILL.md 末尾添加参考文档索引
- **关联原则**: 以代码为真

### 15. docx SKILL.md 未提及 scripts/document.py 和 scripts/utilities.py
- **严重级别**: P2
- **位置**: `docx/SKILL.md`
- **证据**:
  - 文档: 仅引用 `ooxml/scripts/unpack.py`、`ooxml/scripts/pack.py`、`docx-js.md`、`ooxml.md`
  - 代码: `scripts/document.py`、`scripts/utilities.py`、`scripts/__init__.py` 和 `scripts/templates/*.xml`（5 个模板文件）均存在但未被提及
- **影响**: 开发者不了解可用的文档操作脚本
- **建议**: 在 SKILL.md 中记录这些脚本的用途
- **关联原则**: 以代码为真

### 16. pptx ooxml/scripts/ 包含 docx 相关验证代码
- **严重级别**: P2
- **位置**: `pptx/ooxml/scripts/validation/docx.py`
- **证据**:
  - 文档: pptx skill 未提及包含 docx 验证逻辑
  - 代码: `pptx/ooxml/scripts/validation/docx.py` 和 `pptx/ooxml/scripts/validation/redlining.py` 存在于 pptx 目录下，与 docx 目录结构完全重复
- **影响**: 混淆模块职责边界；`docx/` 和 `pptx/` 的 `ooxml/` 子目录完全相同（28 个 XSD + 相同的脚本），疑似不必要的重复
- **建议**: 确认是否需要在两个 skill 中维护相同的 ooxml 代码，考虑提取公共模块
- **关联原则**: 以代码为真

### 17. AGENTS.md Skill 目录结构描述不完整
- **严重级别**: P2
- **位置**: `AGENTS.md:8`
- **证据**:
  - 文档: "可选 `references/`、`assets/`、`themes/` 等子目录"
  - 代码: 实际还存在 `scripts/`、`ooxml/`、`data/`、`templates/`、`canvas-fonts/` 等子目录类型
- **影响**: 新贡献者对项目结构的理解不完整
- **建议**: 补充实际存在的子目录类型
- **关联原则**: 以代码为真

### 18. README.md 概览表分类数量与实际 Skill 数量不符
- **严重级别**: P2
- **位置**: `README.md:9-17`
- **证据**:
  - 文档: 7 个分类共计 25 个（6+5+3+3+3+3+2）
  - 代码: 实际 29 个；缺少的 4 个应分别归入：
    - `brand-guidelines` → 其他 或 前端开发
    - `canvas-design` → 前端开发 或 新增"设计"分类
    - `find-skills` → 其他
    - `planning-with-files` → 其他 或 工具集成
- **影响**: 分类汇总数字误导
- **建议**: 更新数字和分类
- **关联原则**: 以代码为真

### 19. README 使用说明只展示部分 Skills
- **严重级别**: P2
- **位置**: `README.md:255-278`
- **证据**:
  - 文档: "使用方式"代码块仅列出 12 个 skill 的调用示例
  - 代码: 实际有 29 个可用 skill
- **影响**: 用户看不到全部可用命令
- **建议**: 补全或改为"更多 skill 见上方列表"的提示
- **关联原则**: 以代码为真

### 20. docx 和 pptx 有 LICENSE.txt 但 README 未统一说明
- **严重级别**: P2
- **位置**: `README.md:359-361`
- **证据**:
  - 文档: "各 Skill 的许可证见其目录下的 LICENSE.txt 文件"
  - 代码: 仅 9 个 skill 有 LICENSE.txt（docx, pdf, pptx, xlsx, canvas-design, frontend-design, theme-factory, brand-guidelines, markitdown），其余 20 个无独立许可证文件
- **影响**: 无 LICENSE.txt 的 skill 的许可状态不明确
- **建议**: 明确说明哪些 skill 有独立许可证，其余的默认许可是什么
- **关联原则**: 以代码为真

### 21. markitdown SKILL.md 中 "Nano Banana Pro" 品牌名来源不明
- **严重级别**: P2
- **位置**: `markitdown/SKILL.md:30`
- **证据**:
  - 文档: "Nano Banana Pro will automatically generate, review, and refine the schematic"
  - 代码: 项目中无任何 "Nano Banana Pro" 的引用或定义
- **影响**: 用户不理解该名称指代的是什么工具/服务
- **建议**: 删除该引用（随 #1 的 scientific-schematics 章节一起删除）
- **关联原则**: 以代码为真

### 22. AGENTS.md 提交格式描述只引用了第一次提交
- **严重级别**: P2
- **位置**: `AGENTS.md:25`
- **证据**:
  - 文档: "现有提交为 `init：初始化Ivan的skills`"
  - 代码: 实际已有 2 个提交，第二个为 `新增文档和结构：创建 README.md、CLAUDE.md 和 AGENTS.md...`
- **影响**: 描述过时，未反映最新状态
- **建议**: 删除具体提交引用，保留格式约定即可
- **关联原则**: 以代码为真

---

## P3 — 措辞/格式/链接小问题

### 23. README.md yt-dlp-downloader 未在目录结构中列出
- **严重级别**: P3
- **位置**: `README.md:284-354`
- **证据**: 目录树中遗漏了 `yt-dlp-downloader/` 目录
- **建议**: 添加至目录树

### 24. README.md wechat-article-writer 未在目录结构中列出
- **严重级别**: P3
- **位置**: `README.md:284-354`
- **证据**: 目录树中遗漏了 `wechat-article-writer/` 目录
- **建议**: 添加至目录树

### 25. README.md excel-analysis 未在目录结构中列出
- **严重级别**: P3
- **位置**: `README.md:284-354`
- **证据**: 目录树中遗漏了 `excel-analysis/` 目录
- **建议**: 添加至目录树

### 26. README.md kie-ai-generation 未在目录结构中列出
- **严重级别**: P3
- **位置**: `README.md:284-354`
- **证据**: 目录树中遗漏了 `kie-ai-generation/` 目录
- **建议**: 添加至目录树

### 27. README.md 缺少 AGENTS.md 在目录结构中的声明
- **严重级别**: P3
- **位置**: `README.md:286`
- **证据**:
  - 文档: 目录树列出 `README.md` 和 `CLAUDE.md`，但未列 `AGENTS.md`
  - 代码: `AGENTS.md` 存在于根目录
- **建议**: 在目录树中添加 `AGENTS.md`

### 28. README 和 CLAUDE.md 的 markitdown 描述称"微软开发"但 SKILL.md 来源更准确
- **严重级别**: P3
- **位置**: `README.md:59`
- **证据**:
  - 文档: "微软开发的多格式转 Markdown 工具"
  - 代码: SKILL.md 中 source 字段为 `https://github.com/microsoft/markitdown`，描述为 "a Python tool developed by Microsoft"
- **影响**: 表述一致，无功能影响，但 README 比 SKILL.md 更简化
- **建议**: 保持即可，仅为信息参考

### 29. theme-factory SKILL.md 的 theme-showcase.pdf 未被文档引用
- **严重级别**: P3
- **位置**: `theme-factory/`
- **证据**:
  - 文档: SKILL.md 未提及 `theme-showcase.pdf` 文件
  - 代码: 文件存在于 `theme-factory/theme-showcase.pdf`
- **建议**: 在 SKILL.md 中添加展示文件的说明

### 30. ui-ux-pro-max 存在 __pycache__ 编译缓存文件
- **严重级别**: P3
- **位置**: `ui-ux-pro-max/scripts/__pycache__/core.cpython-314.pyc`
- **证据**: 编译缓存文件不应被版本控制
- **建议**: 添加 `.gitignore` 排除 `__pycache__/`

### 31. xlsx 有 LICENSE.txt 但文档目录结构未体现
- **严重级别**: P3
- **位置**: `README.md` 目录结构 xlsx 部分
- **证据**:
  - 文档: xlsx 目录仅列 `SKILL.md`
  - 代码: 还有 `recalc.py` 和 `LICENSE.txt`
- **建议**: 更新目录树

### 32. .DS_Store 已被 git 跟踪
- **严重级别**: P3
- **位置**: 根目录 `.DS_Store`
- **证据**: `git status` 显示 `.DS_Store` 为已修改的跟踪文件
- **建议**: 从 git 中移除并添加到 `.gitignore`

---

## 按 Skill 汇总（修复前记录）

| Skill | P0 | P1 | P2 | P3 | 状态 |
|-------|:--:|:--:|:--:|:--:|------|
| README.md | - | 2 | 3 | 5 | 不通过 |
| CLAUDE.md | - | 1 | - | - | 不通过 |
| AGENTS.md | - | 1 | 2 | - | 不通过 |
| markitdown | 1 | - | 2 | - | 不通过 |
| ui-ux-pro-max | - | 1 | 2 | 1 | 不通过 |
| n8n-gen-skill | - | 2 | - | - | 不通过 |
| planning-with-files | - | - | 1 | - | 有条件通过 |
| docx | - | - | 1 | - | 有条件通过 |
| pptx | - | - | 1 | - | 有条件通过 |
| theme-factory | - | - | - | 1 | 有条件通过 |
| xlsx | - | - | - | 1 | 有条件通过 |
| 仓库级别 | - | - | - | 2 | 有条件通过 |
| 其余 18 个 Skill | - | - | - | - | 通过 |

---

## 修复建议优先级（修复前记录，现已执行）

1. **立即修复（P0）**: 删除 markitdown SKILL.md 中 scientific-schematics 相关章节
2. **尽快修复（P1）**:
   - 修正 ui-ux-pro-max 的 `.codex/scripts/` 路径为 `scripts/`
   - 更新 README.md 和 CLAUDE.md 的 skill 数量（25 → 29）并补全遗漏的 4 个 skill
   - 修复 n8n-gen-skill 的 name 字段和缺失的输入文件
   - 更新 README 目录结构和 AGENTS.md 的描述
3. **计划修复（P2）**: 补充文档中遗漏的脚本、stack、子目录引用
4. **择机修复（P3）**: 目录树细节补全、`.gitignore` 优化
