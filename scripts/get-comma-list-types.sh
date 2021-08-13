#!/usr/bin/env bash
# Simple attempt at finding all comma-delimited list types
curl 'https://raw.githubusercontent.com/tree-sitter/tree-sitter-typescript/d598c96714a2dc9e346589c63369aff6719a51e6/typescript/src/grammar.json' \
  | jq -c '.rules | to_entries[] | select(.value | [.. | .value? == ","] | any) | {parent: .key, child: .value | .. | select(.type? == "SYMBOL") | .name}' \
  | sort -u