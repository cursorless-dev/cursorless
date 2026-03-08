#!/usr/bin/env bash
set -euo pipefail

find .. -name '*.test.ts' -print0 | xargs -0 -n 50 pnpm run build:base --outdir=dist --out-extension:.js=.cjs
