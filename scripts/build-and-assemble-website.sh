#!/usr/bin/env bash
set -euox pipefail

pnpm install
pnpm compile

NODE_OPTIONS="--max-old-space-size=6144" \
  pnpm \
  -F 'cursorless-org' \
  -F 'cursorless-org-docs' \
  build

pnpm -r generate-railroad

# Merge the root site and the documentation site, placing the documentation site
# under docs/

root_dir=dist/cursorless-org
docs_dir="$root_dir/docs"

# Important to remove the root dir first! otherwise we might end up with old removed files from the root dir that are still present in the docs dir, which would be bad since we want to remove old files that are no longer present in the new build.
rm -rf "$root_dir"
mkdir -p "$root_dir"
mkdir -p "$docs_dir"

cp -r packages/cursorless-org/out/* "$root_dir"
cp -r packages/cursorless-org-docs/build/* "$docs_dir"
cp packages/cursorless-vscode/out/railroad.html "$root_dir/keyboard-modal-railroad.html"
cp packages/cursorless-engine/out/railroad.html "$root_dir/custom-command-railroad.html"
