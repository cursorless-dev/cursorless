import { ActionType, Command, PartialTargetV0V1 } from "@cursorless/common";
import { isString } from "../../util/type";

export function upgradeAncientCommand(
  spokenFormOrCommand: string | Command,
  rest: unknown[],
) {
  let command: Command;

  if (isString(spokenFormOrCommand)) {
    const spokenForm = spokenFormOrCommand;
    const [action, targets, ...extraArgs] = rest as [
      ActionType,
      PartialTargetV0V1[],
      ...unknown[],
    ];

    command = {
      version: 0,
      spokenForm,
      action,
      targets,
      extraArgs,
      usePrePhraseSnapshot: false,
    };
  } else {
    command = spokenFormOrCommand;
  }

  return command;
}
