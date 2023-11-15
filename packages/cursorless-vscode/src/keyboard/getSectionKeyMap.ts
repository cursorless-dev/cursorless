import { isTesting } from "@cursorless/common";
import { merge } from "lodash";
import * as vscode from "vscode";
import { SectionName } from "./KeyHandler";
import { Keymap } from "./defaultKeymaps";

export function getSectionKeyMap<T>(
  sectionName: SectionName,
  defaultKeyMap: Keymap<T>,
): Keymap<T> {
  const userOverrides: Keymap<T> = isTesting()
    ? {}
    : vscode.workspace
        .getConfiguration("cursorless.experimental.keyboard.modal.keybindings")
        .get<Keymap<T>>(sectionName) ?? {};
  return merge({}, defaultKeyMap, userOverrides);
}
