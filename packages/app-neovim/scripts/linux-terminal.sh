#!/usr/bin/env bash
# shellcheck disable=SC2068
set -euo pipefail

if command -v gnome-terminal &>/dev/null; then
  # FIXME: Possibly have to use ;exec bash to not auto-close the terminal
  gnome-terminal -- $@
elif command -v gnome-console &>/dev/null; then
  gnome-console -- $@
elif command -v konsole &>/dev/null; then
  konsole --hold -e $@
elif command -v xfce4-terminal &>/dev/null; then
  xfce4-terminal --hold -e $@
elif command -v kitty &>/dev/null; then
  kitty -1 --hold $@
elif command -v alacritty &>/dev/null; then
  alacritty --hold -e $@
elif command -v wezterm &>/dev/null; then
  wezterm --config "exit_behavior='Hold'" start --always-new-process $@
else
  echo "No supported terminal emulator found. File an issue to get it added."
  exit 1
fi
