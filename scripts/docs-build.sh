#!/usr/bin/env bash

set -euo pipefail

# We still need the main project to have all depedencies
# it will be compiled as part of API docs generation
pnpm install

# Build the documentation site
cd docs-site
yarn install --frozen-lockfile
yarn build
cd ..

# Merge the root site and the documentation site, placing the documentation site
# under docs/
root_dir=dist/cursorless-org
mkdir -p "$root_dir"
cp -r cursorless-nx/dist/apps/cursorless-org/exported/* "$root_dir"

docs_dir="$root_dir/docs"
mkdir -p "$docs_dir"
cp -r docs-site/build/* "$docs_dir"
