#!/usr/bin/env bash

esbuild \
    --outfile=out/talon.js \
    --platform=neutral \
    --format=esm \
    --main-fields=main,module \
    --conditions=cursorless:bundler \
    --bundle \
    --sourcemap \
    --external:std \
    --external:talon \
    $@


if [ $? -ne 0 ]; then
    exit 1
fi


# Talon javascript files needs to start with an import from Talon before any other code
TALON_IMPORT='import { Context as DefaultContext } from "talon";'
sed -i'' -e "1s/^/${TALON_IMPORT}\n\n/" out/talon.js
