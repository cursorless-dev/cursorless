#!/usr/bin/env bash
# We don't set -u so we can safely test for the presence of the "CI" environment variable or not
# Indeed, we can't just "env | grep CI" as it contains runNeovimTestsCI.ts, etc. which would give a false positive
# https://stackoverflow.com/questions/64182595/how-to-determine-if-ci-script-is-running-on-github-server
# https://gist.github.com/mohanpedala/1e2ff5661761d3abd0385e8223e16425#set--u
set -eo pipefail

in_dir=../../cursorless.nvim
out_dir=../../dist/cursorless.nvim

if [[ ! -z "$CI" ]]; then
  # If running in CI, only copy the necessary files for testing

  mkdir -p "$out_dir/node/test-harness/out"

  # copy the built .js file
  cp package.json "$out_dir/node/test-harness/"
  cp out/index.cjs "$out_dir/node/test-harness/out/"
else
  # If running locally, make the .map files available to allow debugging

  mkdir -p "$out_dir/node"

  # For Windows, you need Administrator privileges to create a symlink, so we assume it was created manually by the user
  # during initial setup to avoid having to run vscode as Administrator
  # https://github.com/orgs/community/discussions/23591
  # https://stackoverflow.com/questions/18641864/git-bash-shell-fails-to-create-symbolic-links/40914277#40914277
  unameOut="$(uname -s)"
  case "${unameOut}" in
      Linux*)     machine=Linux;;
      Darwin*)    machine=Mac;;
      CYGWIN*)    machine=Cygwin;;
      MINGW*)     machine=MinGw;;  # Windows Git Bash
      MSYS_NT*)   machine=Git;;
      *)          machine="UNKNOWN:${unameOut}"
  esac

  # Symlink so we inherit the .map files as well
  if [[ "$machine" != "MinGw" ]]; then
    ln -sf "$(pwd)" "$out_dir/node/test-harness"
  fi
fi
