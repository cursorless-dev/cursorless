#!/usr/bin/env bash
set -euo pipefail
# Fail if there are any TODOs in the codebase

# Find the string 'TODO' in all files tracked by git, excluding
# this file
TODOS_FOUND=$(git grep --color=always -nw TODO -- ':!scripts/forbid-todo.sh' ':!.github/workflows/forbid-todo.yml' || true)

if [ -n "$TODOS_FOUND" ]; then
  printf "\e[1;31mERROR: \e[0mTODOs found in codebase:\n"
  printf '%s\n' "$TODOS_FOUND"
  exit 1
fi
