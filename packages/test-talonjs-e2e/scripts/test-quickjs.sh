#!/usr/bin/env bash
set -euox pipefail

QUICKJS_VERSION=2024-01-13

esbuild \
    src/quickjsTest.ts \
    --outfile=out/quickjsTest.mjs \
    --platform=neutral \
    --format=esm \
    --main-fields=main,module \
    --bundle \
    --external:std \
    --external:node:crypto

cd out

if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install quickjs
    # Brew doesn't actually publish different versions of the quickjs binary
    # brew install quickjs@$QUICKJS_VERSION

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

curl -o $QUICKJS_FILE $QUICKJS_URL

unzip $QUICKJS_FILE

./qjs -I quickjsTest.mjs
