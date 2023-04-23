#!/usr/bin/env bash
set -euo pipefail
# Bundles and installs a local version of Cursorless, uninstalling production
# Cursorless first and using a special extension id to break update chain

# 1. Build local cursorless, using special extension id to break update chain
pnpm esbuild:prod
pnpm -F cheatsheet-local build:prod
pnpm populate-dist --local-install

# 2. Bundle the extension
cd dist
vsce package -o ../bundle.vsix

# 3. Uninstall production cursorless
code --uninstall-extension pokey.cursorless || echo "Cursorless not currently installed"

# 4. Install local Cursorless
code --install-extension ../bundle.vsix --force

echo -e "\e[1;32mPlease restart VSCode\e[0m"
echo "To uninstall and revert to production Cursorless, run the adjacent uninstall-local.sh"
