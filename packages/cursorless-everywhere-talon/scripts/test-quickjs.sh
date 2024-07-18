#!/usr/bin/env bash

esbuild \
    --outfile=testOut/talon \
    --platform=neutral \
    --format=esm \
    src/test/talonMock.ts

esbuild \
    --outfile=testOut/quickjsTest.js \
    --platform=neutral \
    --format=esm \
    src/test/quickjsTest.ts

cp -r out/talon.js testOut/cursorless.mjs

cd testOut

qjs -I cursorless.mjs quickjsTest.js
