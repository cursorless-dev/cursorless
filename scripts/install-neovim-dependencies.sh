#!/usr/bin/env bash
set -euo pipefail

npm install -g neovim@5.1.0

git clone https://github.com/vim-scripts/BufOnly.vim ${TEMP_DIR}/BufOnly.vim
git clone https://github.com/hands-free-vim/talon.nvim ${TEMP_DIR}/talon.nvim
