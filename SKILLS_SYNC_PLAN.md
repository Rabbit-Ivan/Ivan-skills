# Ivan Skills 同步与分发方案（参考文档）

## 1. 方案摘要
你当前的理解整体正确：

- 可以把 `Rabbit-Ivan/Ivan-skills` 作为 Skills 分发源。
- 通过 `npx skills add <owner/repo>` 在不同客户端统一安装和更新。
- 后续换电脑或分享给同事时，只需要执行安装命令即可同步。

需要校正的一点：

- `skills` 生态的核心是仓库中的 `SKILL.md` 目录结构。
- `.agent/skills` 是部分客户端的本地安装目录，不是唯一的“分发格式标准”。

---

## 2. 已确认的决策

1. **唯一真源**：仓库为真源（`Ivan-skills`）。
2. **同步触发方式**：手动命令触发（简单、可控）。
3. **目录规范**：保持现状，不迁移到 `skills/<name>/SKILL.md`。
4. **默认目标客户端**：`codex`、`claude-code`、`opencode`、`antigravity`。

---

## 3. 目标与范围

### 3.1 目标

- 把“手动复制粘贴同步”升级为“仓库统一管理 + 一键安装更新”。
- 降低多客户端维护成本。
- 支持跨设备快速恢复 Skills。

### 3.2 范围内

- 新增同步脚本、校验脚本、Make 命令入口。
- 更新仓库文档（README、AGENTS.md）。
- 明确标准流程（新增 Skill、导入、校验、发布）。

### 3.3 范围外

- 不改每个 Skill 的业务内容。
- 不迁移当前目录结构。
- 不开发独立 npm 包。

---

## 4. 实施设计

### 4.1 新增脚本

#### `scripts/skills-manager.sh`
统一入口脚本，支持以下子命令：

1. `install-self`
- 从你的 GitHub 仓库安装到本机多客户端。
- 目标命令：

```bash
npx -y skills add Rabbit-Ivan/Ivan-skills --yes --global \
  --agent codex \
  --agent claude-code \
  --agent opencode \
  --agent antigravity
```

2. `import-from-agents`
- 从 `~/.agents/skills` 导入到当前仓库根目录（用于“先本地试用，后入库”）。
- 规则：
  - 仅处理包含 `SKILL.md` 的目录。
  - 同名目录默认覆盖。
  - 支持 `--dry-run` 预览。

3. `install-others <owner/repo>`
- 安装第三方 Skills 到默认四客户端。

4. `list-self`
- 运行仓库技能识别检查：

```bash
npx -y skills add Rabbit-Ivan/Ivan-skills --list
```

5. 错误处理
- 任意步骤失败即退出（非 0）。
- 输出明确失败原因（命令失败、目录缺失、缺少 `SKILL.md`）。

#### `scripts/skills-validate.sh`
仓库内容校验脚本（只读检查）：

- 每个 Skill 目录必须存在 `SKILL.md`。
- 名称冲突检查（大小写归一后不可重复）。
- 忽略目录：`.git`、`node_modules`、`scripts`。
- 成功时输出 Skill 总数；失败时列出问题并退出非 0。

---

## 5. 命令入口（Makefile）

建议提供以下命令别名：

```makefile
skills-list      # 列出并验证远程可识别技能
skills-install   # 安装当前仓库技能到默认四客户端
skills-import    # 从 ~/.agents/skills 导入到仓库
skills-validate  # 校验仓库技能结构和完整性
```

---

## 6. 标准工作流

### 6.1 新增第三方 Skill 并入库

1. 用 `npx skills add <owner/repo>` 先安装到本地。
2. 执行 `make skills-import` 导入仓库。
3. 执行 `make skills-validate` 校验。
4. `git add/commit/push` 发布到 GitHub。

### 6.2 新机器快速同步

1. 克隆仓库。
2. 在仓库根目录执行 `make skills-install`。
3. 客户端即可识别并使用同一套 Skills。

### 6.3 给同事共享

1. 同事执行：

```bash
npx -y skills add Rabbit-Ivan/Ivan-skills --yes --global
```

2. 或者按需要指定 agent。

---

## 7. 验收标准

1. `make skills-list` 可稳定识别仓库技能（数量与预期一致）。
2. `make skills-install` 后，四端均可看到对应技能。
3. 在 `~/.agents/skills` 人工新增 Skill 后，`make skills-import` 能正确导入。
4. 故意删除某目录 `SKILL.md` 后，`make skills-validate` 必须报错并退出非 0。
5. 现有技能目录和关键文件不被误删。

---

## 8. 风险与规避

1. **风险**：同时在多个目录手改，造成内容漂移。  
   **规避**：始终以仓库为真源，统一走导入流程。

2. **风险**：第三方 Skill 目录结构不规范。  
   **规避**：导入前后执行 `skills-validate`。

3. **风险**：后续目录迁移影响外部引用。  
   **规避**：本期不迁移目录，先稳定流程。

---

## 9. 后续可选优化（非本期）

1. 增加 `pre-push` 提醒：推送前自动跑 `skills-validate`。
2. 给 `import-from-agents` 增加白名单参数（仅导入指定 skill）。
3. 输出导入差异报告（新增/覆盖/删除统计）。

---

## 10. 参考链接

- skills 网站：<https://skills.sh/>
- skills 文档：<https://skills.sh/docs>
- skills 仓库（命令与参数参考）：<https://github.com/agent-skills/skills>
