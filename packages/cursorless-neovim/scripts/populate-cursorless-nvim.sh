#!/usr/bin/env bash
set -euo pipefail

in_dir=../../cursorless.nvim
out_dir=../../dist/cursorless.nvim

mkdir -p "$out_dir/node/cursorless-neovim/out"

# copy .lua and .vim dependencies as well as other static files
cp -r "$in_dir/README.md" "$out_dir/"
cp -r "$in_dir/assets" "$out_dir/"
cp -r "$in_dir/lua" "$out_dir/"
cp -r "$in_dir/vim" "$out_dir/"
cp -r "$in_dir/node/command-server" "$out_dir/node/command-server"

# copy the built .js file
cp package.json "$out_dir/node/cursorless-neovim/"
cp out/index.cjs "$out_dir/node/cursorless-neovim/out/"
