#!/usr/bin/env bash

set -euo pipefail

esbuild \
    ./src/extension.ts \
    --outfile=dist/extension.cjs \
    --format=cjs \
    --bundle \
    --external:vscode \
    --platform=node \
    --conditions=cursorless:bundler \
    "$@"
