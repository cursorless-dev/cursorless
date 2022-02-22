#!/bin/sh

# We still need the main project to have all depedencies
# it will be compiled as part of API docs generation
yarn install --frozen-lockfile

cd website
yarn install --frozen-lockfile
yarn run copy-docs && yarn build
cd ..