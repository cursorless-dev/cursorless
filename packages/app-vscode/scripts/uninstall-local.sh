#!/usr/bin/env bash
set -euo pipefail

# Use CURSORLESS_VSCODE_COMMAND if set, otherwise default to 'code'
vscode_command="${CURSORLESS_VSCODE_COMMAND:-code}"

# Ensure VSCode command is installed
if ! command -v "$vscode_command" &>/dev/null; then
  echo "VSCode command '$vscode_command' not found"
  echo "Install VS Code or set CURSORLESS_VSCODE_COMMAND to your VS Code binary (e.g., 'codium', 'cursor')"
  echo "See: https://code.visualstudio.com/docs/editor/command-line"
  exit 1
fi

# Switch back to production Cursorless extension locally after having run
# ./install-local.sh

# 1. Uninstall local cursorless
"$vscode_command" --uninstall-extension pokey.cursorless-development || echo "Cursorless development version not currently installed"

# 2. Install production Cursorless
"$vscode_command" --install-extension pokey.cursorless

echo -e "\e[1;32mPlease restart VSCode\e[0m"
