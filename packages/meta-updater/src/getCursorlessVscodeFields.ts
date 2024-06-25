import { cursorlessCommandDescriptions } from "@cursorless/common";
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
    ],
  };
}
