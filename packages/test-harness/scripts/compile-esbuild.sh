#!/usr/bin/env bash
set -euo pipefail

# Compile vscode test runner
./scripts/run-esbuild.sh \
    ./src/runners/extensionTestsVscode.ts \
    --outfile=out/extensionTestsVscode.cjs

# Compile neovim test runner
./scripts/run-esbuild.sh \
    ./src/runners/extensionTestsNeovim.ts \
    --outfile=out/extensionTestsNeovim.cjs

# Compile test cases
find .. -name '*.test.ts' -print0 |
    xargs -0 -n 50 ./scripts/run-esbuild.sh --outdir=out --out-extension:.js=.cjs
