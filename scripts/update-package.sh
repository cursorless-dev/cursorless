#!/usr/bin/env bash
set -euo pipefail

cat package.json | jq '.scripts |= . + {"compile": "tsc --build --pretty"}' >package.new.json
mv package.new.json package.json
