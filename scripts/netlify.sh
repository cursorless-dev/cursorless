#!/usr/bin/env bash
set -euo pipefail

pnpm install
pnpm compile
pnpm build
bash -x scripts/assemble-website.sh
