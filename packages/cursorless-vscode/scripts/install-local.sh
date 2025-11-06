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

# Bundles and installs a local version of Cursorless, uninstalling production
# Cursorless first and using a special extension id to break update chain

# 1. Build local cursorless, using special extension id to break update chain
pnpm esbuild:prod
pnpm -F cheatsheet-local build:prod
pnpm -F cursorless-vscode-tutorial-webview build
pnpm populate-dist --local-install

# 2. Bundle the extension
cd dist
vsce package -o ../bundle.vsix

# 3. Uninstall production cursorless
"$vscode_command" --uninstall-extension pokey.cursorless || echo "Cursorless not currently installed"

# 4. Install local Cursorless
"$vscode_command" --install-extension ../bundle.vsix --force

echo -e "\e[1;32mPlease restart VSCode\e[0m"
echo "To uninstall and revert to production Cursorless, run the adjacent uninstall-local.sh"
