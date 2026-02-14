#!/usr/bin/env bash
set -euo pipefail

REPO="${SKILLS_REPO:-Rabbit-Ivan/Ivan-skills}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="${ROOT_DIR}/skills"
AGENTS_DIR="${AGENTS_SKILLS_DIR:-$HOME/.agents/skills}"

usage() {
  cat <<'USAGE'
用法：scripts/skills-manager.sh <command> [args]

命令：
  install-self                 安装当前仓库全部 skills
  list-self                    查看当前仓库 skills 列表
  install-others <owner/repo>  安装第三方 skills 仓库
  import-from-agents [--dry-run]
                               从 ~/.agents/skills 导入到 ./skills
USAGE
}

install_self() {
  npx -y skills add "$REPO" --yes --global --all
}

list_self() {
  npx skills add "$REPO" --list
}

install_others() {
  local target_repo="${1:-}"
  if [[ -z "$target_repo" ]]; then
    echo "错误：请提供 owner/repo，例如 Rabbit-Ivan/Ivan-skills" >&2
    exit 1
  fi
  npx -y skills add "$target_repo" --yes --global --all
}

import_from_agents() {
  local dry_run="false"
  if [[ "${1:-}" == "--dry-run" ]]; then
    dry_run="true"
  elif [[ -n "${1:-}" ]]; then
    echo "错误：未知参数 ${1}" >&2
    exit 1
  fi

  if [[ ! -d "$AGENTS_DIR" ]]; then
    echo "错误：源目录不存在：$AGENTS_DIR" >&2
    exit 1
  fi

  mkdir -p "$SKILLS_DIR"

  local found="0"
  while IFS= read -r src; do
    found="1"
    local name
    name="$(basename "$src")"
    local skill_file="$src/SKILL.md"
    local dst="$SKILLS_DIR/$name"

    if [[ ! -f "$skill_file" ]]; then
      echo "跳过：${name}（缺少 SKILL.md）"
      continue
    fi

    if [[ -e "$dst" ]]; then
      echo "跳过：${name}（目标已存在）"
      continue
    fi

    if [[ "$dry_run" == "true" ]]; then
      echo "[DRY-RUN] 将导入：$src -> $dst"
    else
      cp -R "$src" "$dst"
      echo "已导入：${name}"
    fi
  done < <(find "$AGENTS_DIR" -mindepth 1 -maxdepth 1 -type d | sort)

  if [[ "$found" == "0" ]]; then
    echo "提示：$AGENTS_DIR 下未发现可导入目录"
  fi
}

main() {
  local cmd="${1:-}"
  case "$cmd" in
    install-self)
      shift
      install_self "$@"
      ;;
    list-self)
      shift
      list_self "$@"
      ;;
    install-others)
      shift
      install_others "$@"
      ;;
    import-from-agents)
      shift
      import_from_agents "$@"
      ;;
    -h|--help|help|"")
      usage
      ;;
    *)
      echo "错误：未知命令 $cmd" >&2
      usage
      exit 1
      ;;
  esac
}

main "$@"
