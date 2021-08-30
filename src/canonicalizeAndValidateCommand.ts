import canonicalizeActionName from "./canonicalizeActionName";
import canonicalizeTargets from "./canonicalizeTargets";
import { ActionType, PartialTarget, SelectionType } from "./typings/Types";
import { getPrimitiveTargets } from "./util/targetUtils";

export function canonicalizeAndValidateCommand(
  inputActionName: string,
  inputPartialTargets: PartialTarget[],
  inputExtraArgs: any[]
) {
  const actionName = canonicalizeActionName(inputActionName);
  const partialTargets = canonicalizeTargets(inputPartialTargets);
  const extraArgs = inputExtraArgs;

  validateCommand(actionName, partialTargets, extraArgs);

  return {
    actionName,
    partialTargets,
    extraArgs,
  };
}

export function validateCommand(
  actionName: ActionType,
  partialTargets: PartialTarget[],
  extraArgs: any[]
) {
  if (
    usesSelectionType("notebookCell", partialTargets) &&
    !["editNewLineAbove", "editNewLineBelow"].includes(actionName)
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
  return getPrimitiveTargets(partialTargets).some(
    (partialTarget) => partialTarget.selectionType === selectionType
  );
}
