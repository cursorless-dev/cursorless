#!/usr/bin/env bash
set -euo pipefail

echo CURSORLESS_REPO_ROOT=${CURSORLESS_REPO_ROOT}

git clone https://github.com/vim-scripts/BufOnly.vim /home/runner/BufOnly.vim
git clone https://github.com/hands-free-vim/talon.nvim /home/runner/talon.nvim
