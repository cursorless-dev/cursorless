#!/usr/bin/env bash
set -euo pipefail
# my-ts-node: a script to bundle TypeScript files with esbuild and execute them directly, with optional sourcemaps

# Extract the first argument as the file to run
FILE_TO_RUN="$1"
shift

# Check if the file to run has been provided
if [ -z "$FILE_TO_RUN" ]; then
  echo "Error: No input file specified."
  echo "Usage: my-ts-node <file.ts> [script args...]"
  exit 1
fi

# Check if DEBUG is set and add sourcemaps if it is
SOURCEMAP_FLAG=""
if [ -n "${DEBUG:-}" ]; then
  SOURCEMAP_FLAG="--sourcemap"
fi

# Generate tmp dir for output and source map
tmpdir=$(mktemp -d 2>/dev/null || mktemp -d -t 'my-ts-node')
function finish {
  rm -rf "$tmpdir"
}
trap finish EXIT

outfile="$tmpdir/out.js"

echo "Bundling $FILE_TO_RUN to $outfile"

esbuild $SOURCEMAP_FLAG --conditions=cursorless:bundler --bundle --platform=node "${FILE_TO_RUN}" --outfile="${outfile}"

# Bundle the TypeScript file using esbuild and execute it with node, passing any additional arguments to node
node "$outfile" "$@"
