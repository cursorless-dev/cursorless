#!/usr/bin/env bash

set -euo pipefail

# Merge the root site and the documentation site, placing the documentation site
# under docs/
root_dir=dist/cursorless-org
mkdir -p "$root_dir"
cp -r packages/cursorless-org/out/* "$root_dir"

docs_dir="$root_dir/docs"
mkdir -p "$docs_dir"
cp -r packages/cursorless-org-docs/build/* "$docs_dir"
