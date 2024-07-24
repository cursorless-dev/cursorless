#!/usr/bin/env bash
set -euo pipefail

# Initialize an empty array to hold the test files
TESTS=()

# Read the output of the find command into the TESTS array
while IFS= read -r file; do
    TESTS+=("$file")
done < <(find .. -name '*.test.ts')

BATCH_SIZE=50
SIZE=${#TESTS[@]}

for ((i = 0; i < SIZE; i += BATCH_SIZE)); do
    BATCH=${TESTS[@]:i:BATCH_SIZE}
    pnpm run build:base --outdir=dist --out-extension:.js=.cjs $BATCH
done