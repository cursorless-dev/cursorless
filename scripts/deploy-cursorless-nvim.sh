#!/usr/bin/env bash
# This script is used to push to the cursorless.nvim github production repo
set -euo pipefail

staging_dir="$1"

# Delete the old files
cd "$staging_dir"
git rm -r '*'
cd -

# copy static files
cp -r cursorless.nvim/* "$staging_dir/"

# copy the built .js file
mkdir -p "$staging_dir/node/cursorless-neovim/out"
cp packages/cursorless-neovim/package.json "$staging_dir/node/cursorless-neovim/"
cp packages/cursorless-neovim/out/index.cjs "$staging_dir/node/cursorless-neovim/out/"

# Extract commit message and body
commit_message="$(git log -1 --pretty=format:"%s" HEAD)"
commit_body="$(git log -1 --pretty=format:"%b" HEAD)"
author_name=$(git log -1 --pretty=format:"%an" HEAD)
author_email=$(git log -1 --pretty=format:"%ae" HEAD)
author_date=$(git log -1 --pretty=format:"%ad" --date=iso-strict HEAD)

# Push to cursorless.nvim
cd "$staging_dir"

rm -rf test/ .busted
git add .
GIT_AUTHOR_NAME="$author_name" GIT_AUTHOR_EMAIL="$author_email" GIT_AUTHOR_DATE="$author_date" \
  git commit -m "$commit_message" -m "$commit_body" || true
git push
