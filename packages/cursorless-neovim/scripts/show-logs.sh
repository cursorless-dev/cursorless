#!/usr/bin/env bash
set -euo pipefail

log_path="${CURSORLESS_REPO_ROOT}/packages/cursorless-neovim/out/nvim_node.log"

# Be robust to the log file not existing yet
touch "${log_path}"

echo "Logs will appear below once you start debugging Cursorless Neovim:"
tail -f "${log_path}"
