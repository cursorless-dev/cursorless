import {
  cursorlessCommandDescriptions,
  cursorlessCommandIds,
} from "@cursorless/common";
import { PackageJson } from "type-fest";

export function getCursorlessVscodeFields(input: PackageJson) {
  return {
    contributes: {
      ...(input.contributes as object),
      commands: Object.entries(cursorlessCommandDescriptions).map(
        ([id, { title, isVisible }]) => ({
          command: id,
          title,
          ...(isVisible ? {} : { enablement: "false" }),
        }),
      ),
    },

    activationEvents: [
      // Causes extension to activate whenever any text editor is opened
      "onLanguage",

      // Causes extension to activate when the Cursorless scope support side bar
      // is opened
      "onView:cursorless.scopeSupport",

      // Causes extension to activate when any Cursorless command is run.
      // Technically we don't need to do this since VSCode 1.74.0, but we support
      // older versions
      ...cursorlessCommandIds.map((id) => `onCommand:${id}`),
    ],
  };
}
