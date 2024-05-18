#!/usr/bin/env bash
set -euo pipefail

out_dir=../../dist/cursorless.nvim
#mkdir -p "$out_dir/node/test-harness/out"

# copy the built .js file
#cp package.json "$out_dir/node/test-harness/"
#cp out/index.cjs "$out_dir/node/test-harness/out/"

ln -s /home/runner/work/cursorless/cursorless/packages/test-harness "$out_dir/node/test-harness"
