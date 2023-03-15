#!/usr/bin/env bash
set -euo pipefail

# Bundles and installs a local version of Cursorless, uninstalling production
# Cursorless first and using a special extension id to break update chain

# 1. Uninstall production cursorless
code --uninstall-extension pokey.cursorless || echo "Cursorless not currently installed"

# 2. Build local cursorless, using special extension id to break update chain
pnpm esbuild:prod
pnpm -F cheatsheet-local build:prod
pnpm populate-dist --local-install

# 3. Bundle the extension
cd dist
vsce package --allow-star-activation -o ../bundle.vsix

# 4. Install local Cursorless
code --install-extension ../bundle.vsix
