#!/usr/bin/env bash
set -euo pipefail

pnpm install
pnpm compile

NODE_OPTIONS="--max-old-space-size=4096" \
  pnpm \
  --filter 'cursorless-org' \
  --filter 'cursorless-org-*' \
  build

# Merge the root site and the documentation site, placing the documentation site
# under docs/

root_dir=dist/cursorless-org
docs_dir="$root_dir/docs"

mkdir -p "$root_dir"
mkdir -p "$docs_dir"

cp -r packages/cursorless-org/out/* "$root_dir"
cp -r packages/cursorless-org-docs/build/* "$docs_dir"
