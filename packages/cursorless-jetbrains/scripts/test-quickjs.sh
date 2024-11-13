#!/usr/bin/env bash
set -euo pipefail
set -euo pipefail

QUICKJS_VERSION=2024-01-13

echo $ cd out
cd out

if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install quickjs
    # Brew doesn't actually publish different versions of the quickjs binary
    # brew install quickjs@$QUICKJS_VERSION

    echo $ qjs -I quickjsTest.mjs
    qjs -I quickjsTest.mjs

    exit 0
fi

QUICKJS_URL_WIN=https://bellard.org/quickjs/binary_releases/quickjs-win-x86_64-$QUICKJS_VERSION.zip
QUICKJS_URL_LINUX=https://bellard.org/quickjs/binary_releases/quickjs-linux-x86_64-$QUICKJS_VERSION.zip
QUICKJS_FILE=quickjs.zip

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    QUICKJS_URL=$QUICKJS_URL_LINUX
elif [[ "$OSTYPE" == "cygwin" ]]; then
    QUICKJS_URL=$QUICKJS_URL_WIN
elif [[ "$OSTYPE" == "msys" ]]; then
    QUICKJS_URL=$QUICKJS_URL_WIN
elif [[ "$OSTYPE" == "win32" ]]; then
    QUICKJS_URL=$QUICKJS_URL_WIN
else
    echo "ERROR Unsupported OS: $OSTYPE"
    exit 1
fi

echo $ curl -o $QUICKJS_FILE $QUICKJS_URL
curl -o $QUICKJS_FILE $QUICKJS_URL

echo $ unzip $QUICKJS_FILE
unzip $QUICKJS_FILE

echo $ ./qjs -I cursorless.js
./qjs  --module cursorless.js
