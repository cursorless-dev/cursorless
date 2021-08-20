import { ActionType, PartialTarget, ScopeType } from "./typings/Types";
import { getPrimitiveTargets } from "./util/targetUtils";

export function checkCommandValidity(
  actionName: ActionType,
  partialTargets: PartialTarget[],
  extraArgs: any[]
) {
  if (
    usesScopeType("notebookCell", partialTargets) &&
    !["editNewLineAbove", "editNewLineBelow"].includes(actionName)
  ) {
    throw new Error(
      "The notebookCell scope type is currently only supported with the actions editNewLineAbove and editNewLineBelow"
    );
  }
}

function usesScopeType(scopeType: ScopeType, partialTargets: PartialTarget[]) {
  return getPrimitiveTargets(partialTargets).some(
    (partialTarget) =>
      partialTarget.modifier?.type === "containingScope" &&
      partialTarget.modifier.scopeType === scopeType
  );
}
