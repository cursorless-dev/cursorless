#!/usr/bin/env bash
set -euo pipefail

# lua-language-server should be installed automatically by the flake.nix dev shell
# or .github/workflows/pre-commit.yml
if ! type lua-language-server &>/dev/null; then
  echo "ERROR: lua-language-server is not installed. Please run 'nix develop' or install it manually."
  exit 1
fi

if [ ! -e "${CURSORLESS_REPO_ROOT-nonexistent}" ]; then
  CURSORLESS_REPO_ROOT=$(git rev-parse --show-toplevel)
fi

function check_file() {
  local file="$1"
  logpath="$(mktemp -d)"
  rm -rf "$logpath/check.json"
  result=$(lua-language-server --check "$file" \
    --checklevel="Warning" \
    --configpath="${CURSORLESS_REPO_ROOT}/.luarc.json" \
    --logpath="$logpath")
  if [[ ! "$result" == *"no problems found"* ]]; then
    if [ -e "$logpath/check.json" ]; then
      cat "$logpath/check.json"
    else
      echo "ERROR: lua-language-server failed to run."
      echo "$result"
    fi
    return 1

  fi
  return 0
}

# lua-language-server doesn't support single file parsing, so check entire folder
exit_code=0
if ! check_file .; then
  exit_code=1
fi

exit $exit_code
