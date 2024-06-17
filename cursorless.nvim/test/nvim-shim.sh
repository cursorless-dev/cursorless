#!/usr/bin/env bash
set -euo pipefail

export XDG_CONFIG_HOME='test/xdg/config/'
export XDG_STATE_HOME='test/xdg/local/state/'
export XDG_DATA_HOME='test/xdg/local/share/'

# FIXME: For the flake.nix devshell I plan to eventually just install the unwrapped binary straight up so I can
# reference it for these tests, but until then...
function resolve_nvim_path() {
  nvim=$(type -p "nvim" | awk '{print $NF}')
  if file "${nvim}" | grep -q 'executable'; then
    echo "${nvim}"
    return
  fi

  # On NixOS, this might still be a wrapper, so we need to make sure we find the real binary
  current_link="${nvim}"
  while [ -L "${current_link}" ]; do
    current_link=$(readlink "${current_link}")
  done
  nvim="${current_link}"

  if file "${current_link}" | grep -q 'script'; then
    nvim=$(grep 'exec -a' "${current_link}" | cut -f4 -d" " | tr -d '"')
  fi
  echo "${nvim}"
}

mkdir -p ${XDG_CONFIG_HOME} ${XDG_STATE_HOME} ${XDG_DATA_HOME}
mkdir -p ${XDG_DATA_HOME}/nvim/site/pack/testing/start || true
link_path="${XDG_DATA_HOME}/nvim/site/pack/testing/start/cursorless.nvim"
if [ ! -e "${link_path}" ]; then
  # FIXME: Expects to be in cursorless.nvim, so we should force cd here?
  ln -sf "${PWD}" ${link_path}
fi

NVIM=$(resolve_nvim_path)

# shellcheck disable=SC2068
${NVIM} --cmd 'set loadplugins' -l $@
exit_code=$?
rm ${link_path} 2>/dev/null || true

exit $exit_code
