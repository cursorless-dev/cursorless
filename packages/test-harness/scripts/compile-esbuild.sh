#!/usr/bin/env bash

set -euo pipefail

esbuild \
    --format=cjs \
    --bundle \
    --conditions=cursorless:bundler \
    --external:vscode \
    --external:./reporters/parallel-buffered \
    --external:./worker.js \
    --external:talon \
    --platform=node \
    --sourcemap \
    "$@"
