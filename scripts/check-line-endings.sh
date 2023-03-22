#!/usr/bin/env bash
set -euo pipefail
# Checks that files passed in match their setting for the eol attribute in
# .gitattributes.  Note that binary files will not have an eol attribute, so
# we don't need to worry about them.

check_attr_output=$(git check-attr eol $*)
lines=$(echo "$check_attr_output" | grep "eol: lf" || true)
files=$(echo "$lines" | cut -d: -f1)

bad=$(fgrep -l $'\r' $files || true)

if [ -n "$bad" ]; then
  echo "$bad"
  exit 1
fi
