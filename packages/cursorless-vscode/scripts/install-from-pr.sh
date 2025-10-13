#!/usr/bin/env bash
set -eo pipefail
# Installs a version of Cursorless from a PR branch, uninstalling production
# Cursorless first and using a special extension id to break update chain.
# Requires gh cli to be installed (https://cli.github.com/).

# Ensure we have a variable at $1 (the pr number)
if [ -z "$1" ]; then
  echo "Usage: install-from-pr $1 <pr-number> $2 <optional-cli-name>" # I'm sure there's a better way to specifiy this argument is optional than this but idk what it is
  exit 1
fi

# Ensure gh cli is installed
if ! command -v gh &>/dev/null; then
  echo "gh cli could not be found.  See https://cli.github.com/"
  exit 1
fi

# Skip VSCode cli check if a cli tool name is specified by the user
if [ -z "$2" ]; then
  # Ensure VSCode 'code' command is installed
  if ! command -v code &>/dev/null; then
    echo "VSCode 'code' command not found; see https://code.visualstudio.com/docs/editor/command-line#_launching-from-command-line"
    exit 1
  fi
fi

pr_number="$1"
repo="cursorless-dev/cursorless"

# 1. Get latest check runs from PR, waiting for them to finish if necessary
checks=$(gh pr checks --repo "$repo" "$pr_number" || echo "still-running")
if [[ $checks == *still-running ]]; then
  gh pr checks --repo "$repo" "$pr_number" --watch
  checks=$(gh pr checks --repo "$repo" "$pr_number" || echo "still-running")
fi

# 2. Get desired check run (ubuntu-latest, stable)
check_number=$(echo "$checks" | grep -F 'Test (ubuntu-latest, stable)' | cut -d / -f8)
echo "Downloading vsix for PR $pr_number from check $check_number"

# Temp directory to put downloaded extension
tmpdir=$(mktemp -d 2>/dev/null || mktemp -d -t 'cursorless-vsix')
function finish {
  rm -rf "$tmpdir"
}
trap finish EXIT

# 3. Download extension vsix
gh run download "$check_number" --repo "$repo" --name vsix --dir "$tmpdir"

if [ -z "$2" ]; then
  # 4. Uninstall production cursorless
  code --uninstall-extension pokey.cursorless || echo "Cursorless not currently installed"

  # 5. Install downloaded extension
  code --install-extension "$tmpdir/cursorless-development.vsix" --force
else
  # We need to build the above two commands in an array due to having the cli tool passed as an argument to this script
  # See https://unix.stackexchange.com/a/444949 for why using eval for this is a bad idea

  # 4. Uninstall production cursorless
  cmd_uninstall=($2)
  cmd_uninstall+=(--uninstall-extension pokey.cursorless \|\| echo "Cursorless not currently installed")
  echo ${cmd_uninstall[@]}
  "${cmd_uninstall[@]}"

  # 5. Install downloaded extension
  cmd_from_pr=($2)
  cmd_from_pr+=(--install-extension "$tmpdir/cursorless-development.vsix" --force)
  "${cmd_from_pr[@]}"
fi

echo -e "\e[1;32mPlease restart VSCode\e[0m"
echo "To uninstall and revert to production Cursorless, run the adjacent uninstall-local.sh"
