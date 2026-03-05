# Ivan Skills 管理中心

这个仓库用于统一管理我的 Claude Code skills，当前以 `skills/` 目录为唯一事实来源。

## 安装与同步

交互式安装（可选 skill 和 agent）：

```bash
npx skills add https://github.com/Rabbit-Ivan/Ivan-skills/tree/main/skills
```

全量安装（推荐）：

```bash
npx -y skills add https://github.com/Rabbit-Ivan/Ivan-skills/tree/main/skills --all --global
```

查看可安装 skills：

```bash
npx -y skills add https://github.com/Rabbit-Ivan/Ivan-skills/tree/main/skills --list
```

安装单个 skill（以 pdf 为例）：

```bash
npx -y skills add https://github.com/Rabbit-Ivan/Ivan-skills/tree/main/skills/pdf --global
```

## 仓库结构

```text
Ivan-skills/
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md
│       ├── references/      # 可选
│       ├── scripts/         # 可选
│       ├── assets/          # 可选
│       └── ...
├── AGENTS.md
├── README.md
└── SKILL.md
```

说明：
- 当前 `skills/` 下共 30 个 skill 目录。
- 每个 skill 至少包含 `SKILL.md`。
- `skills_backup_20260214/` 仅作本地备份，不进入版本管理。

## 维护流程

1. 新建分支：`git checkout -b feature/<topic>`。
2. 在 `skills/` 中新增或更新 skill。
3. 如有必要，同步更新 `README.md` / `AGENTS.md`。
4. 本地自检后提交并推送分支。
5. 通过 PR 合并到 `main`。

## 命名规范

- skill 目录名使用 kebab-case，例如：`wechat-article-writer`。
- 入口文件名统一为 `SKILL.md`。
- 附加资料按用途放到 `references/`、`scripts/`、`assets/` 等子目录。
