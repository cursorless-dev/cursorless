#!/usr/bin/env bash
set -euo pipefail

in_dir=../../cursorless.nvim
out_dir=../../dist/cursorless.nvim

# https://stackoverflow.com/questions/64182595/how-to-determine-if-ci-script-is-running-on-github-server
(env | grep CI 1>/dev/null) && is_ci=true || is_ci=false

if [[ "$is_ci" == "true" ]]; then
  # If running in CI, only copy the necessary files for deployment

  mkdir -p "$out_dir/node/cursorless-neovim/out"

  # copy static files such as .lua dependencies and command-server
  cp -r "$in_dir" "$out_dir/../"

  # copy the built .js file
  cp package.json "$out_dir/node/cursorless-neovim/"
  cp out/index.cjs "$out_dir/node/cursorless-neovim/out/"
else
  # If running locally, make the .map files available to allow debugging

  mkdir -p "$out_dir/node"

  # copy static files such as .lua dependencies and command-server
  cp -r "$in_dir" "$out_dir/../"

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
    ln -sf "$(pwd)" "$out_dir/node/cursorless-neovim"
  fi
fi
