#!/usr/bin/env bash
set -euo pipefail

# First get all arguments that start with a dash
# and remove them from the positional parameters
# so that we can pass the rest to the command.
# We support arbitrary options, and just forward them to the command.
# This is useful for passing options to pnpm.
# For example, to run the command in a dry-run mode, you can do:
# ./scripts/auto-add-dependency.sh -r --dry-run
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
