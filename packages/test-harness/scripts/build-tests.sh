#!/usr/bin/env bash
set -euo pipefail

mapfile -t TESTS < <(find .. -name '*.test.ts')

BATCH_SIZE=50
SIZE=${#TESTS[@]}

for ((i = 0; i < SIZE; i += BATCH_SIZE)); do
    BATCH=${TESTS[@]:i:BATCH_SIZE}
    pnpm run build:base --outdir=dist --out-extension:.js=.cjs $BATCH
done
