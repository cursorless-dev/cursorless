#!/usr/bin/env bash

esbuild \
    ./src/extension.ts \
    --sourcemap \
    --format=esm \
    --bundle \
    --platform=neutral \
    --external:talon \
    --external:postcss \
    --main-fields=main \
    --outfile=./out/talon.js
