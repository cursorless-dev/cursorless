#!/usr/bin/env bash
set -euo pipefail
# Checks that files passed in as arguments are explicitly listed in .gitattributes.
# Based on https://github.com/alexkaratarakis/gitattributes#ci-step

missing_attributes=$(git check-attr --all $* | grep "text: auto" || true)

if [ -n "$missing_attributes" ]; then
  echo "$missing_attributes" | cut -d: -f1
  exit 1
fi
