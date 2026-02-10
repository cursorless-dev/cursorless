#!/usr/bin/env bash
set -euo pipefail

# Build a standalone IIFE bundle for HatBox's embedded QuickJS engine.
# Unlike the TalonJS bundle, this:
#   - Uses IIFE format (QuickJS doesn't support ESM imports)
#   - Does NOT externalize "talon" (Talon is fully mocked internally)
#   - Does NOT prepend a Talon import

esbuild \
  --outfile=out/hatbox-cursorless.bundle.js \
  --platform=neutral \
  --format=iife \
  --main-fields=main,module \
  --conditions=cursorless:bundler \
  --bundle \
  --external:node:crypto \
  "$@"
