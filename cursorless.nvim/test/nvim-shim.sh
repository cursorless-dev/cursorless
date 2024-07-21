#!/usr/bin/env bash
set -euo pipefail

if ! [[ "${PWD}" == *"cursorless.nvim" ]]; then
  echo "ERROR: This script must be run from inside cursorless.nvim/ directory"
  exit 1
fi

test_folder=$(mktemp -d "${TMPDIR-/tmp}"/cursorless-busted-test-XXXXX)
export XDG_CONFIG_HOME="${test_folder}/xdg/config/"
export XDG_STATE_HOME="${test_folder}/xdg/local/state/"
export XDG_DATA_HOME="${test_folder}/xdg/local/share/"
dependency_folder="${XDG_DATA_HOME}/nvim/site/pack/testing/start/"
plugin_folder="${XDG_CONFIG_HOME}/nvim/plugin/"

mkdir -p "${plugin_folder}" "${XDG_STATE_HOME}" "${dependency_folder}"
ln -sf "${PWD}" "${dependency_folder}/cursorless.nvim"

# Link in standalone helper functions we want all tests to be able to call
ln -sf "${PWD}/test/helpers.lua" "${plugin_folder}/helpers.lua"

# shellcheck disable=SC2068
command nvim --cmd 'set loadplugins' -l $@
exit_code=$?

rm -rf "${test_folder}"

exit $exit_code
