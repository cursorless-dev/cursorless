#!/usr/bin/env bash
set -euo pipefail

echo "Populating dist directory..."
echo "CURSORLESS_REPO_ROOT: $CURSORLESS_REPO_ROOT"
cursorless_nvim_dir="$CURSORLESS_REPO_ROOT/cursorless.nvim"
cursorless_neovim_node_in_dir="$CURSORLESS_REPO_ROOT/packages/cursorless-neovim"
test_harness_node_in_dir="$CURSORLESS_REPO_ROOT/packages/test-harness"

if [[ "${CI:-x}" == "true" ]]; then
  # If running in CI, only copy the necessary files for testing
  out_dir="$CURSORLESS_REPO_ROOT/dist/cursorless.nvim"

  # copy static files such as .lua dependencies and command-server
  cp -r "$cursorless_nvim_dir/*" "$out_dir"

  # Populate cursorless-neovim
  cursorless_neovim_node_out_dir="$out_dir/node/cursorless-neovim"
  mkdir -p "$cursorless_neovim_node_out_dir/out"
  cp "$cursorless_neovim_node_in_dir/package.json" "$cursorless_neovim_node_out_dir"
  cp "$cursorless_neovim_node_in_dir/out/index.cjs" "$cursorless_neovim_node_out_dir/out"

  # Populate test-harness
  test_harness_node_out_dir="$out_dir/node/test-harness"
  mkdir -p "$test_harness_node_out_dir/out"
  cp "$test_harness_node_in_dir/package.json" "$test_harness_node_out_dir"
  cp "$test_harness_node_in_dir/out/index.cjs" "$test_harness_node_out_dir/out"
else
  # Symlink so we inherit the .map files as well, but only if uname doesn't
  # start with "MINGW" (Windows Git Bash)
  #
  # For Windows, you need Administrator privileges to create a symlink, so we
  # assume it was created manually by the user during initial setup to avoid
  # having to run vscode as Administrator
  # https://github.com/orgs/community/discussions/23591
  # https://stackoverflow.com/questions/18641864/git-bash-shell-fails-to-create-symbolic-links/40914277#40914277
  if [[ "$(uname -s)" != MINGW* ]]; then
    cursorless_neovim_node_out_dir="$cursorless_nvim_dir/node/cursorless-neovim"
    rm -f "$cursorless_neovim_node_out_dir"
    ln -s "$cursorless_neovim_node_in_dir" "$cursorless_neovim_node_out_dir"

    test_harness_node_out_dir="$cursorless_nvim_dir/node/test-harness"
    rm -f "$test_harness_node_out_dir"
    ln -s "$test_harness_node_in_dir" "$test_harness_node_out_dir"
  fi
fi
