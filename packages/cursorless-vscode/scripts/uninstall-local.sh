#!/usr/bin/env bash
set -eo pipefail

# Switch back to production Cursorless extension locally after having run
# ./install-local.sh or ./install-from-pr.sh

if [ -z "$1" ]; then
    # 1. Uninstall local cursorless
    code --uninstall-extension pokey.cursorless-development || echo "Cursorless development version not currently installed"

    # 2. Install production Cursorless
    code --install-extension pokey.cursorless
else
    # Construct above commands in arrays to use specified cli tool name (see comments in ./install-from-pr.sh at line 59)
    cmd_uninstall=($1)
    cmd_uninstall+=(--uninstall-extension pokey.cursorless-development \|\| echo "Cursorless development version not currently installed")
    "${cmd_uninstall[@]}"

    cmd_install_prod=($1)
    cmd_install_prod+=(--install-extension pokey.cursorless)
    "${cmd_install_prod[@]}"
fi

echo -e "\e[1;32mPlease restart VSCode\e[0m"
