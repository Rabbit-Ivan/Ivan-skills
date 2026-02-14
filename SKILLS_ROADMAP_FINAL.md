# Ivan-skills Skills 管理与分发方案（最终版）

## 1. 目标与结论

本方案用于将当前仓库升级为可持续维护、可团队分发的 Skills 真源仓库。

最终决策：

1. 采用 `skills/` 目录作为统一存放位置（与你的管理习惯一致）。
2. 以 GitHub 仓库作为唯一真源，新增/修改 Skill 后通过 `git push` 同步。
3. 对外分发统一使用 `npx skills add <owner>/<repo>`。
4. 在目录迁移基础上，补充脚本化治理能力（安装、校验、导入、验收）。

## 2. 官方入口与约定

### 2.1 安装入口（对内/对外统一）

```bash
npx skills add Rabbit-Ivan/Ivan-skills
```

### 2.2 全量安装建议

```bash
npx -y skills add Rabbit-Ivan/Ivan-skills --yes --global --all
```

说明：

1. 不使用 `npx add ...` 或 `mpx ...` 作为入口。
2. 推荐 `--all` 覆盖所有支持的 agent，减少手动选择成本。

## 3. 目录与命名规范

## 3.1 目标目录结构

```text
Ivan-skills/
  skills/
    <skill-name>/
      SKILL.md
      references/|assets/|scripts/|...
  README.md
  AGENTS.md
  CLAUDE.md
```

### 3.2 命名规则

1. Skill 目录使用 kebab-case，例如 `code-review/`。
2. `SKILL.md` 的 frontmatter `name` 建议与目录名一致（kebab-case）。

## 4. 实施步骤

### Step 1：目录迁移（一次性）

1. 创建 `skills/` 目录。
2. 将现有 29 个 skill 目录移动到 `skills/` 下（建议使用 `git mv`）。
3. 修正不规范 name（如 `Excel Analysis` -> `excel-analysis`）。
4. 仅在必要时清理散落文档，避免过度删除。

### Step 2：文档更新

更新以下文件中的路径与安装说明：

1. `README.md`
2. `AGENTS.md`
3. `CLAUDE.md`

重点增加：

1. `npx skills add Rabbit-Ivan/Ivan-skills`
2. 目录结构示例改为 `skills/<name>/SKILL.md`

### Step 3：脚本化治理（来自同步方案的增强部分）

新增脚本：

1. `scripts/skills-manager.sh`
2. `scripts/skills-validate.sh`

建议子命令：

1. `install-self`：安装当前仓库 skills（默认 `--all`）。
2. `list-self`：`npx skills add Rabbit-Ivan/Ivan-skills --list`
3. `install-others <owner/repo>`：安装第三方仓库。
4. `import-from-agents`：从 `~/.agents/skills` 导入到 `skills/`（支持 `--dry-run`）。

### Step 4：Makefile 统一入口

建议增加命令：

```makefile
skills-list
skills-install
skills-import
skills-validate
```

## 5. 日常工作流

### 5.1 新增一个 Skill（例如 code-review）

1. 在 `skills/code-review/` 下创建 `SKILL.md` 与相关资源。
2. 本地校验：`make skills-validate`
3. 提交并推送：`git add && git commit && git push`
4. 远端验证：`npx skills add Rabbit-Ivan/Ivan-skills --list`

### 5.2 同事安装

同事执行一条命令：

```bash
npx -y skills add Rabbit-Ivan/Ivan-skills --yes --global --all
```

## 6. 验收标准

1. `skills/` 下 Skill 数量与预期一致（当前应为 29）。
2. 每个 Skill 目录都存在 `SKILL.md`。
3. `npx skills add Rabbit-Ivan/Ivan-skills --list` 能识别完整技能列表。
4. 同事在新机器执行安装命令后可在支持的 agent 中使用这些 skills。
5. 新增 Skill 后仅需 `git push` 即可被后续安装命令获取。

## 7. 风险与回滚

### 7.1 主要风险

1. 迁移后文档路径未同步，导致使用者理解偏差。
2. 个别 `SKILL.md` 内部相对路径失效。
3. 目录命名与 frontmatter `name` 不一致，影响识别与维护。

### 7.2 规避手段

1. 迁移后立即执行 `skills-validate` 与 `--list` 验证。
2. 在 PR 中强制检查 `README.md` / `AGENTS.md` / `CLAUDE.md` 路径一致性。
3. 统一使用 kebab-case 命名规则。

### 7.3 回滚策略

1. 迁移提交独立成一个 commit，便于 `git revert`。
2. 出现识别问题时，优先回滚目录迁移提交，再逐项排查。

## 8. 非本期范围

1. 不改写每个 Skill 的业务内容。
2. 不开发独立 npm 包。
3. 不做与 skills 分发无关的大规模文档重构。

## 9. 一句话执行版

先把 Skill 统一迁移到 `skills/`，再补齐 `install/validate/import` 脚本与 Make 命令；之后新增 Skill 只需放入 `skills/<name>/` 并 `git push`，团队即可通过 `npx skills add Rabbit-Ivan/Ivan-skills` 一键同步。
