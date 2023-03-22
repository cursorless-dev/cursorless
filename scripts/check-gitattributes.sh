#!/usr/bin/env bash
set -euo pipefail
# Checks that files passed in as arguments are explicitly listed in
# .gitattributes. We use a dummy catch-all rule `* cursorless.missing` in
# `.gitattributes` that will catch any file that isn't explicitly listed.

check_attr_output=$(git check-attr cursorless.missing $*)
missing_attributes=$(echo "$check_attr_output" | grep "cursorless.missing: set" || true)

if [ -n "$missing_attributes" ]; then
  echo "$missing_attributes" | cut -d: -f1
  exit 1
fi
