#!/usr/bin/env bash
set -euo pipefail

cursorless_nvim_dir="$CURSORLESS_REPO_ROOT/cursorless.nvim"
node_in_dir="$CURSORLESS_REPO_ROOT/packages/test-harness"

if [[ "${CI:-x}" == "true" ]]; then
  # If running in CI, only copy the necessary files for testing
  out_dir="$CURSORLESS_REPO_ROOT/dist/cursorless.nvim"
  node_out_dir="$out_dir/node/test-harness"

  mkdir -p "$node_out_dir/out"

  # copy the built .js file
  cp "$node_in_dir/package.json" "$node_out_dir"
  cp "$node_in_dir/out/index.cjs" "$node_out_dir/out"
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
    ln -sf "$node_in_dir" "$cursorless_nvim_dir/node/test-harness"
  fi
fi
