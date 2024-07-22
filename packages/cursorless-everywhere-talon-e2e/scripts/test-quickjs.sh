#!/usr/bin/env bash

echo $ esbuild ... src/quickjsTest.ts
esbuild \
    --outfile=testOut/quickjsTest.mjs \
    --platform=neutral \
    --format=esm \
    --main-fields=main,module \
    --conditions=cursorless:bundler \
    --bundle \
    --external:std \
    src/quickjsTest.ts

echo $ cd testOut
cd testOut

# QUICKJS_URL=https://bellard.org/quickjs/binary_releases/quickjs-win-x86_64-2024-01-13.zip
QUICKJS_URL=https://bellard.org/quickjs/binary_releases/quickjs-linux-x86_64-2024-01-13.zip
QUICKJS_FILE=quickjs.zip

echo $ curl -o $QUICKJS_FILE $QUICKJS_URL
curl -o $QUICKJS_FILE $QUICKJS_URL

echo $ unzip $QUICKJS_FILE
unzip $QUICKJS_FILE

export CURSORLESS_MODE=test

echo $ ./qjs -I quickjsTest.mjs
./qjs -I quickjsTest.mjs
