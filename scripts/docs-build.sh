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
rm -rf website-root/docs
mkdir -p website-root/docs
cp -r website/build/* website-root/docs
