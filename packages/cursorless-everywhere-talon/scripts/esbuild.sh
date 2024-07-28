#!/usr/bin/env bash
set -euo pipefail

esbuild \
  --outfile=out/talon.js \
  --platform=neutral \
  --format=esm \
  --main-fields=main,module \
  --conditions=cursorless:bundler \
  --bundle \
  --sourcemap \
  --external:talon \
  "$@"

# Talon javascript files needs to start with an import from Talon before any other code
TALON_IMPORT='import { Context as DefaultContext } from "talon";'
sed -i'' -e "1s/^/${TALON_IMPORT}\n\n/" out/talon.js
