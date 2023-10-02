#!/usr/bin/env bash
# Fail if there are any TODOs in the codebase

# Find the string 'TODO' in all files tracked by git, excluding
# this file
TODOS_FOUND=$(git grep --color=always -nw TODO -- ':!scripts/forbid-todo.sh')

if [ -n "$TODOS_FOUND" ]; then
  printf "\e[1;31mERROR: \e[0mTODOs found in codebase:\n"
  printf %s "$TODOS_FOUND\n"
  exit 1
fi
