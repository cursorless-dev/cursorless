#!/usr/bin/env bash

set -euo pipefail

esbuild \
    ./src/index.ts \
    --outfile=./out/index.js \
    --format=esm \
    --bundle \
    --packages=external \
    --sourcemap \
    "$@"
