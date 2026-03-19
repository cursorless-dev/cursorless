#!/usr/bin/env bash
set -euox pipefail

pnpm install

NODE_OPTIONS="--max-old-space-size=6144" \
  pnpm \
  -F '@cursorless/app-web' \
  -F '@cursorless/app-web-docs' \
  build

pnpm -r generate-railroad

# Merge the root site and the documentation site, placing the documentation site
# under docs/

root_dir=dist/app-web
docs_dir="$root_dir/docs"

# Important to remove the root dir first! otherwise we might end up with old removed files from the root dir that are still present in the docs dir, which would be bad since we want to remove old files that are no longer present in the new build.
rm -rf "$root_dir"
mkdir -p "$root_dir"
mkdir -p "$docs_dir"

cp -r packages/app-web/out/* "$root_dir"
cp -r packages/app-web-docs/build/* "$docs_dir"
cp packages/app-vscode/out/railroad.html "$root_dir/keyboard-modal-railroad.html"
cp packages/lib-engine/out/railroad.html "$root_dir/custom-command-railroad.html"
