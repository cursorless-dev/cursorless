#!/usr/bin/env bash

esbuild \
    ./src/extension.ts \
    --outfile=./out/talon.js \
    --platform=neutral \
    --main-fields=main \
    --format=esm \
    --bundle \
    --sourcemap \
    --external:talon \
    --external:postcss \
    $@ \
    # --minify \
