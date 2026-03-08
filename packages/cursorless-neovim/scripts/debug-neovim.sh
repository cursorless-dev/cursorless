#!/usr/bin/env bash
set -euo pipefail

workspaceFolder="$1"
cursorless_mode="$2"

export CURSORLESS_REPO_ROOT="${workspaceFolder}"
export NVIM_NODE_HOST_DEBUG="1"
export NVIM_NODE_LOG_FILE="${workspaceFolder}/packages/cursorless-neovim/out/nvim_node.log"
export NVIM_NODE_LOG_LEVEL="info"
export CURSORLESS_MODE="${cursorless_mode}"

command nvim -u "${workspaceFolder}/init.lua"
