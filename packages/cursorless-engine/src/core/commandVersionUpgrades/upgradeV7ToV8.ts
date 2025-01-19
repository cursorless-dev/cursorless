import type { CommandV7, CommandV8 } from "@cursorless/common";

export function upgradeV7ToV8(command: CommandV7): CommandV8 {
  return { ...command, version: 8, action: upgradeAction(command.action) };
}

function upgradeAction(action: CommandV7["action"]): CommandV8["action"] {
  if (action.name === "generateSnippet") {
    throw Error(
      `Action "generateSnippet" is not possible to upgrade to api version 8. Please install latest version of cursorless-talon`,
    );
  }
  return action;
}
