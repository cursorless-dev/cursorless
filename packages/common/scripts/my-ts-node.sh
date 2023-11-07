#!/usr/bin/env bash
set -euo pipefail
# my-ts-node: a script to bundle TypeScript files with esbuild and execute them directly

# Extract the first argument as the file to run
FILE_TO_RUN="$1"
shift

# Check if the file to run has been provided
if [ -z "$FILE_TO_RUN" ]; then
  echo "Error: No input file specified."
  echo "Usage: my-ts-node <file.ts> [script args...]"
  exit 1
fi

# Generate tmp dir for output and source map
tmpdir="./out/my-ts-node-tmp"
mkdir -p "$tmpdir"
function finish {
  rm -rf "$tmpdir"
}
trap finish EXIT

outfile="$tmpdir/out.cjs"

esbuild --sourcemap --log-level=warning --conditions=cursorless:bundler --bundle --format=cjs --platform=node "${FILE_TO_RUN}" --outfile="${outfile}"

# Bundle the TypeScript file using esbuild and execute it with node, passing any additional arguments to node
node "$outfile" "$@"
