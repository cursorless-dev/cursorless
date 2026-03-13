#!/usr/bin/env bash

set -euo pipefail

esbuild \
    ./src/index.ts \
    --outfile=./out/index.cjs \
    --format=cjs \
    --bundle \
    --platform=node \
    --conditions=cursorless:bundler \
    "$@"
