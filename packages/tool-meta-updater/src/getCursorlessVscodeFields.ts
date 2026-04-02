import type { PackageJson } from "type-fest";
import { cursorlessCommandDescriptions } from "@cursorless/lib-common";

export function getCursorlessVscodeFields(input: PackageJson) {
  return {
    contributes: {
      ...(input.contributes as object),
      commands: Object.entries(cursorlessCommandDescriptions).map(
        ([id, { title, isVisible }]) =>
          Object.assign(
            { command: id, title },
            isVisible ? {} : { enablement: "false" },
          ),
      ),
    },

    activationEvents: [
      // Causes extension to activate whenever any text editor is opened
      "onLanguage",
    ],
  };
}
