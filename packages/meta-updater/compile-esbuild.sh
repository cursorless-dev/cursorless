#!/usr/bin/env bash

set -euo pipefail

esbuild \
    ./src/index.ts \
    --outfile=dist/index.cjs \
    --format=cjs \
    --conditions=cursorless:bundler \
    --bundle \
    --platform=node \
    --external:@reflink/* \
    --external:./get-uid-gid.js \
    "$@"
