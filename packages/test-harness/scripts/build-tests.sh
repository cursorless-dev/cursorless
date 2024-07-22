#!/usr/bin/env bash
set -euo pipefail

TESTS="$(find .. -name '*.talonjs.test.ts')"

pnpm run build:base --outdir=dist --out-extension:.js=.cjs $TESTS
