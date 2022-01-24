import canonicalizeActionName from "./canonicalizeActionName";
import canonicalizeTargets from "./canonicalizeTargets";
import { ActionType, PartialTarget, SelectionType } from "../typings/Types";
import { getPartialPrimitiveTargets } from "./getPrimitiveTargets";
import {
  CommandArgument,
  CommandArgumentComplete,
  LATEST_VERSION,
} from "../core/commandRunner/types";
import { ActionableError } from "../errors";
import { commands } from "vscode";

/**
 * Given a command argument which comes from the client, normalize it so that it
 * conforms to the latest version of the expected cursorless command argument.
 *
 * @param commandArgument The command argument to normalize
 * @returns The normalized command argument
 */
export function canonicalizeAndValidateCommand(
  commandArgument: CommandArgument
): CommandArgumentComplete {
  const {
    action: inputActionName,
    targets: inputPartialTargets,
    extraArgs: inputExtraArgs = [],
    usePrePhraseSnapshot = false,
    version,
    ...rest
  } = commandArgument;

  if (version > LATEST_VERSION) {
    throw new ActionableError(
      "Cursorless Talon version is ahead of Cursorless extension version. Please update cursorless extension.",
      [
        {
          name: "Check for updates",
          action: () =>
            commands.executeCommand(
              "workbench.extensions.action.checkForUpdates"
            ),
        },
      ]
    );
  }

  const actionName = canonicalizeActionName(inputActionName);
  const partialTargets = canonicalizeTargets(inputPartialTargets);
  const extraArgs = inputExtraArgs;

  validateCommand(actionName, partialTargets, extraArgs);

  return {
    ...rest,
    version: LATEST_VERSION,
    action: actionName,
    targets: partialTargets,
    extraArgs: extraArgs,
    usePrePhraseSnapshot,
  };
}

export function validateCommand(
  actionName: ActionType,
  partialTargets: PartialTarget[],
  extraArgs: any[]
) {
  if (
    usesSelectionType("notebookCell", partialTargets) &&
    !["editNewLineBefore", "editNewLineAfter"].includes(actionName)
  ) {
    throw new Error(
      "The notebookCell scope type is currently only supported with the actions editNewLineAbove and editNewLineBelow"
    );
  }
}

function usesSelectionType(
  selectionType: SelectionType,
  partialTargets: PartialTarget[]
) {
  return getPartialPrimitiveTargets(partialTargets).some(
    (partialTarget) => partialTarget.selectionType === selectionType
  );
}
