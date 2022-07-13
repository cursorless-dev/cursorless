#!/usr/bin/env bash

set -euo pipefail

# We still need the main project to have all depedencies
# it will be compiled as part of API docs generation
yarn install --frozen-lockfile

cd website
yarn install --frozen-lockfile
yarn build
cd ..

# Since baseUrl in Docusaurus is /docs, for links within our website
# to work correctly we need to serve /website-root with /docs subfolder
# containting the build
out_dir=cursorless-nx/apps/cursorless-org/public/docs
rm -rf "$out_dir"
mkdir -p "$out_dir"
cp -r website/build/* "$out_dir"

cd cursorless-nx
npm ci
npx nx build cursorless-org
