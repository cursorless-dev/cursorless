#!/usr/bin/env bash

set -euo pipefail

esbuild \
    ./src/index.tsx \
    --outfile=./out/index.js \
    --format=cjs \
    --bundle \
    --sourcemap \
    "$@"
