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

sed -i '1s/^/import { Context as DefaultContext } from "talon"\n/' out/talon.js
