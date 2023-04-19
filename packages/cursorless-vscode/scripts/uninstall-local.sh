#!/usr/bin/env bash
set -euo pipefail

# Switch back to production Cursorless extension locally after having run
# ./install-local.sh

# 1. Uninstall local cursorless
code --uninstall-extension pokey.cursorless-development

# 2. Install production Cursorless
code --install-extension pokey.cursorless

echo -e "\e[1;32mPlease restart VSCode\e[0m"
