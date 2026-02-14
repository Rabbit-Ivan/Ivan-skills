#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="${ROOT_DIR}/skills"
EXPECTED_COUNT="${EXPECTED_SKILLS_COUNT:-29}"

if [[ ! -d "$SKILLS_DIR" ]]; then
  echo "错误：未找到目录 $SKILLS_DIR" >&2
  exit 1
fi

error_count=0

legacy_dirs="$(find "$ROOT_DIR" -mindepth 1 -maxdepth 1 -type d ! -name '.git' ! -name 'skills' ! -name 'scripts' -exec test -f '{}/SKILL.md' ';' -print)"
if [[ -n "$legacy_dirs" ]]; then
  echo "错误：发现未迁移的顶层 Skill 目录："
  echo "$legacy_dirs"
  error_count=$((error_count + 1))
fi

skill_dirs=()
while IFS= read -r dir; do
  skill_dirs+=("$dir")
done < <(find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d | sort)
actual_count="${#skill_dirs[@]}"

if [[ "$actual_count" -ne "$EXPECTED_COUNT" ]]; then
  echo "错误：Skill 数量不符合预期，期望 $EXPECTED_COUNT，实际 $actual_count"
  error_count=$((error_count + 1))
fi

for dir in "${skill_dirs[@]}"; do
  base="$(basename "$dir")"
  skill_file="$dir/SKILL.md"

  if [[ ! "$base" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
    echo "错误：目录名不是 kebab-case：$base"
    error_count=$((error_count + 1))
  fi

  if [[ ! -f "$skill_file" ]]; then
    echo "错误：缺少 SKILL.md：$dir"
    error_count=$((error_count + 1))
    continue
  fi

  name_value="$(awk -F': *' '/^name:/{print $2; exit}' "$skill_file" | tr -d '"' | xargs)"
  if [[ -z "$name_value" ]]; then
    echo "错误：name 字段缺失：$skill_file"
    error_count=$((error_count + 1))
    continue
  fi

  if [[ "$name_value" != "$base" ]]; then
    echo "错误：name 与目录名不一致：$skill_file（name=$name_value, dir=$base）"
    error_count=$((error_count + 1))
  fi
done

if [[ "$error_count" -gt 0 ]]; then
  echo "校验失败：共 $error_count 项问题" >&2
  exit 1
fi

echo "校验通过：$actual_count 个 Skill 目录，命名与 SKILL.md 均符合规范"
