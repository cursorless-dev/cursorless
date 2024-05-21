#!/usr/bin/env bash
set -euo pipefail

echo HOME_ROOT=${HOME_ROOT}

# git clone https://github.com/vim-scripts/BufOnly.vim /home/runner/BufOnly.vim
# git clone https://github.com/hands-free-vim/talon.nvim /home/runner/talon.nvim
git clone https://github.com/vim-scripts/BufOnly.vim ${HOME_ROOT}/BufOnly.vim
git clone https://github.com/hands-free-vim/talon.nvim ${HOME_ROOT}/talon.nvim
