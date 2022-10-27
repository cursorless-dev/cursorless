import { Position } from "vscode";
import { strictlyContains } from "../../../util/rangeUtils";
import { TargetScope } from "./scope.types";
import { ScopeIteratorHints } from "./scopeHandler.types";

export function shouldReturnScope(
  position: Position,
  hints: ScopeIteratorHints,
  { domain }: TargetScope,
): boolean {
  const { containment, mustStartBefore } = hints;

  switch (containment) {
    case "disallowed":
      if (domain.contains(position)) {
        return false;
      }
      break;
    case "disallowedStrict":
      if (strictlyContains(domain, position)) {
        return false;
      }
      break;
    case "required":
      if (!domain.contains(position)) {
        return false;
      }
      break;
  }

  if (mustStartBefore != null && !domain.start.isBefore(mustStartBefore)) {
    return false;
  }

  return true;
}
