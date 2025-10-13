#!/usr/bin/env bash
set -eo pipefail
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

if [ -z "$1" ]; then
    # 3. Uninstall production cursorless
    code --uninstall-extension pokey.cursorless || echo "Cursorless not currently installed"

    # 4. Install local Cursorless
    code --install-extension ../bundle.vsix --force
else
    # Construct above commands in arrays to use specified cli tool name (see comments in ./install-from-pr.sh at line 59)
    cmd_uninstall=($1)
    cmd_uninstall+=(--uninstall-extension pokey.cursorless \|\| echo "Cursorless not currently installed")
    "${cmd_uninstall[@]}"

    cmd_install_local=($1)
    cmd_install_local+=(--install-extension ../bundle.vsix --force)
    "${cmd_install_local[@]}"
fi

echo -e "\e[1;32mPlease restart VSCode\e[0m"
echo "To uninstall and revert to production Cursorless, run the adjacent uninstall-local.sh"
