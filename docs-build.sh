#!/bin/sh

yarn install
cd website
yarn install
yarn run copy-docs && yarn build
cd ..