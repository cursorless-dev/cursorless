#!/usr/bin/env bash
set -euo pipefail

find .. -name '*.test.ts' | xargs -n 50 pnpm run build:base --outdir=dist --out-extension:.js=.cjs