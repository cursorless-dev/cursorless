#!/usr/bin/env bash

echo $ esbuild ... src/test/talonMock.ts
esbuild \
    --outfile=testOut/talon \
    --platform=neutral \
    --format=esm \
    src/test/talonMock.ts

echo $ esbuild ... src/test/quickjsTest.ts
esbuild \
    --outfile=testOut/quickjsTest.js \
    --platform=neutral \
    --format=esm \
    src/test/quickjsTest.ts

echo $ cp -r out/talon.js testOut/cursorless.mjs
cp -r out/talon.js testOut/cursorless.mjs

echo $ cd testOut
cd testOut

# QUICKJS_URL=https://bellard.org/quickjs/binary_releases/quickjs-win-x86_64-2024-01-13.zip
QUICKJS_URL=https://bellard.org/quickjs/binary_releases/quickjs-linux-x86_64-2024-01-13.zip
QUICKJS_FILE=quickjs.zip

echo $ curl -o $QUICKJS_FILE $QUICKJS_URL
curl -o $QUICKJS_FILE $QUICKJS_URL

echo $ unzip $QUICKJS_FILE
unzip $QUICKJS_FILE

echo $ ./qjs -I cursorless.mjs quickjsTest.js
export CURSORLESS_MODE=test
./qjs -I cursorless.mjs quickjsTest.js
