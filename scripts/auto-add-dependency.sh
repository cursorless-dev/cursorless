#!/usr/bin/env bash
set -euo pipefail

if [[ "$1" == "--help" ]]; then
  cat <<EOF
Usage: ./scripts/auto-add-dependency.sh [options] <package-name> [import-name]

This script searches for references to <package-name> in all our monorepo packages,
and runs pnpm install for each package that references <package-name>.

You can pass in <import-name> if you want to use a different name for the import.
Additionally, any options you pass in that start with - will be passed to
pnpm install.

For example:

    ./scripts/auto-add-dependency.sh lodash
    ./scripts/auto-add-dependency.sh lodash -D @types/lodash
EOF
  exit 0
fi

# Check that `rg` is installed
if ! command -v rg &>/dev/null; then
  echo "The 'rg' command is required to run this script. Please install it and try again."
  exit 1
fi

dash_args=()
positional_args=()
while [[ $# -gt 0 ]]; do
  case "$1" in
  -*) dash_args+=("$1") ;;
  *) positional_args+=("$1") ;;
  esac
  shift
done

package_name="${positional_args[0]}"
import_name="${positional_args[1]:-$package_name}"

rg -l "$package_name" packages |
  rg -v package.json |
  cut -d/ -f1-2 |
  sort -u |
  xargs -n1 -I{} pnpm -F ./{} add "${dash_args[@]}" "$import_name"
