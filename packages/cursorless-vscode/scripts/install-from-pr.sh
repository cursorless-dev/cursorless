#!/usr/bin/env bash
set -euo pipefail
# Installs a version of Cursorless from a PR branch, uninstalling production
# Cursorless first and using a special extension id to break update chain.
# Requires gh cli to be installed (https://cli.github.com/).

# Ensure we have a PR number
if [ $# -ne 1 ]; then
  echo "Usage: $0 <pr-number>"
  exit 1
fi

# Ensure gh cli is installed
if ! command -v gh &>/dev/null; then
  echo "gh cli could not be found.  See https://cli.github.com/"
  exit 1
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
check_number=$(echo "$checks" | fgrep 'Test (ubuntu-latest, stable)' | cut -d / -f8)
echo "Downloading vsix for PR $pr_number From check $check_number"

# Temp directory to put downloaded extension
tmpdir=$(mktemp -d 2>/dev/null || mktemp -d -t 'cursorless-vsix')
function finish {
  rm -rf "$tmpdir"
}
trap finish EXIT

# 3. Download extension vsix
gh run download $check_number --repo "$repo" --name vsix --dir "$tmpdir"

# 4. Uninstall production cursorless
code --uninstall-extension pokey.cursorless || echo "Cursorless not currently installed"

# 5. Install downloaded extension
code --install-extension "$tmpdir/cursorless-development.vsix" --force

echo -e "\e[1;32mPlease restart VSCode\e[0m"
echo "To uninstall and revert to production Cursorless, run the adjacent uninstall-local.sh"
