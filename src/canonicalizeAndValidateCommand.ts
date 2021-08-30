import canonicalizeActionName from "./canonicalizeActionName";
import canonicalizeTargets from "./canonicalizeTargets";
import { ActionType, PartialTarget, SelectionType } from "./typings/Types";
import { getPrimitiveTargets } from "./util/targetUtils";

export function canonicalizeAndValidateCommand(
  actionName: string,
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

  return {
    actionName: canonicalizeActionName(actionName),
    partialTargets: canonicalizeTargets(partialTargets),
    extraArgs,
  };
}

function usesSelectionType(
  selectionType: SelectionType,
  partialTargets: PartialTarget[]
) {
  return getPrimitiveTargets(partialTargets).some(
    (partialTarget) => partialTarget.selectionType === selectionType
  );
}
