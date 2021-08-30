#!/usr/bin/env bash
# Script to change action names in tests
old_name="$1"
new_name="$2"

fd '.yml' . | xargs sed -E -i '' "s/actionName: ${old_name}$/actionName: ${new_name}/g"