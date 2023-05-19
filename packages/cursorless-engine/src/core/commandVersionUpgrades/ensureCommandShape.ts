import { ActionType, Command, PartialTargetV0V1 } from "@cursorless/common";
import { isString } from "../../util/type";

/**
 * Given a list of arguments, ensure that it has the right shape.
 *
 * @param args Arg list to ensure is a command
 * @returns The command
 */
export function ensureCommandShape(args: unknown[]): Command {
  // FIXME: Use zod or something to validate the command shape
  const [spokenFormOrCommand, ...rest] = args as [
    string | Command,
    ...unknown[],
  ];

  return handleLegacyCommandShape(spokenFormOrCommand, rest);
}

function handleLegacyCommandShape(
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
