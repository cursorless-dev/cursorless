#!/usr/bin/env bash
set -euo pipefail
# Checks that files that are not tagged as binary in .gitattributes do not
# contain CRLF line endings.

check_attr_output=$(git check-attr binary $*)
lines=$(echo "$check_attr_output" | grep -v "binary: set" || true)
files=$(echo "$lines" | cut -d: -f1)

bad=$(fgrep -l $'\r' $files || true)

if [ -n "$bad" ]; then
  echo "$bad"
  exit 1
fi
