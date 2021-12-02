import canonicalizeActionName from "./canonicalizeActionName";
import canonicalizeTargets from "./canonicalizeTargets";
import { ActionType, PartialTarget, SelectionType } from "../typings/Types";
import { getPartialPrimitiveTargets } from "./getPrimitiveTargets";
import {
  CommandArgument,
  CommandArgumentLatest,
} from "../core/commandRunner/types";

export function canonicalizeAndValidateCommand(
  commandArgument: CommandArgument
): CommandArgumentLatest {
  const {
    action: inputActionName,
    targets: inputPartialTargets,
    extraArgs: inputExtraArgs = [],
    ...rest
  } = commandArgument;

  const actionName = canonicalizeActionName(inputActionName);
  const partialTargets = canonicalizeTargets(inputPartialTargets);
  const extraArgs = inputExtraArgs;

  validateCommand(actionName, partialTargets, extraArgs);

  return {
    ...rest,
    version: 1,
    action: actionName,
    targets: partialTargets,
    extraArgs: extraArgs,
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
