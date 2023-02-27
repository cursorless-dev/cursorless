#!/usr/bin/env bash
set -euo pipefail

package_name="$1"

rg -l "$package_name" packages |
  rg -v package.json |
  cut -d/ -f1-2 |
  sort -u |
  xargs -n1 -I{} pnpm -F ./{} add "$package_name"
