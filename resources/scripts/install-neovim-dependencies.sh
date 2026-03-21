#!/usr/bin/env bash
set -euo pipefail

npm install -g neovim@5.1.0

mkdir -p "${TEMP_DIR}"

git clone https://github.com/hands-free-vim/talon.nvim "${TEMP_DIR}/talon.nvim"
