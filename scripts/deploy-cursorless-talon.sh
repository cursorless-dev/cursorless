# This script is used to push the cursorless-talon subtree to the cursorless
# talon repo. We proceed by first performing a git subtree split and then
# cherrypicking any new commits onto the cursorless-talon main branch
set -euo pipefail

# Check out staging branch
git switch -c cursorless-talon-staging origin/cursorless-talon-staging

# Exit if there were no changes to the cursorless-talon directory
[[ "$(git rev-parse $GITHUB_SHA:cursorless-talon)" == "$(git rev-parse cursorless-talon-staging^{tree})" ]] && exit 0

# Fetch current cursorless-talon main
git remote add cursorless-talon 'https://github.com/cursorless-dev/cursorless-talon.git'
git fetch cursorless-talon

# Sanity check that cursorless-talon/main is identical to cursorless-talon-staging
[[ "$(git rev-parse cursorless-talon/main^{tree})" == "$(git rev-parse cursorless-talon-staging^{tree})" ]]

# Tag previous version of staging branch
git tag cursorless-talon-staging-previous cursorless-talon-staging

# Update the staging branch
git switch -c github-sha $GITHUB_SHA
git subtree split --prefix=cursorless-talon --branch=cursorless-talon-staging

# Sanity check that the previous staging commit is an ancestor of the new one
git merge-base --is-ancestor cursorless-talon-staging-previous cursorless-talon-staging

# Checkout and cherry-pick commits onto cursorless-talon/main
git switch -c cursorless-talon-main cursorless-talon/main
git cherry-pick cursorless-talon-staging-previous..cursorless-talon-staging

# Sanity check that cursorless-talon-main is identical to cursorless-talon-staging
[[ "$(git rev-parse cursorless-talon-main^{tree})" == "$(git rev-parse cursorless-talon-staging^{tree})" ]]

# Sanity check that cursorless-talon-main is identical to cursorless-talon
# subdirectory of cursorless-vscode
[[ "$(git rev-parse cursorless-talon-main^{tree})" == "$(git rev-parse $GITHUB_SHA:cursorless-talon)" ]]

# Push to cursorless-talon
git push cursorless-talon cursorless-talon-main:main

# Checkout and push staging branch
git switch cursorless-talon-staging
git push
