#!/usr/bin/env bash
# This script is used to push to the cursorless.nvim github production repo
set -euo pipefail

# Clone current cursorless.nvim main
mkdir -p dist && cd dist
git clone 'https://github.com/hands-free-vim/cursorless.nvim.git' cursorless.nvim-remote
cd -

out_dir=dist/cursorless.nvim-remote

# Delete the old files
cd "$out_dir"
git rm -r '*'
cd -

# copy static files
cp -r cursorless.nvim/* "$out_dir/"

# copy the built .js file
mkdir -p "$out_dir/node/cursorless-neovim/out"
cp packages/cursorless-neovim/package.json "$out_dir/node/cursorless-neovim/"
cp packages/cursorless-neovim/out/index.cjs "$out_dir/node/cursorless-neovim/out/"

# Extract commit message and body
commit_message="$(git log -1 --pretty=format:"%s" HEAD)"
commit_body="$(git log -1 --pretty=format:"%b" HEAD)"
author_name=$(git log -1 --pretty=format:"%an" HEAD)
author_email=$(git log -1 --pretty=format:"%ae" HEAD)
author_date=$(git log -1 --pretty=format:"%ad" --date=iso-strict HEAD)

# Push to cursorless.nvim
cd "$out_dir"

rm -rf test/ .busted
git add .
GIT_AUTHOR_NAME="$author_name" GIT_AUTHOR_EMAIL="$author_email" GIT_AUTHOR_DATE="$author_date" \
  git commit -m "$commit_message" -m "$commit_body" || true
git push
