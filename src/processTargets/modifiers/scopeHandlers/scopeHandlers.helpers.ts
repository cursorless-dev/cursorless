import { Position } from "vscode";
import { Direction } from "../../../typings/targetDescriptor.types";
import { strictlyContains } from "../../../util/rangeUtils";
import { compareTargetScopes } from "./compareTargetScopes";
import { TargetScope } from "./scope.types";
import { ScopeIteratorRequirements } from "./scopeHandler.types";

export function shouldReturnScope(
  position: Position,
  direction: Direction,
  hints: ScopeIteratorRequirements,
  previousScope: TargetScope | undefined,
  scope: TargetScope,
): boolean {
  const { containment, mustStartBefore, disallowBehind } = hints;
  const { domain } = scope;

  if (
    previousScope != null &&
    compareTargetScopes(direction, position, previousScope, scope) >= 0
  ) {
    return false;
  }

  switch (containment) {
    case "disallowed":
      if (domain.contains(position)) {
        return false;
      }
      break;
    case "disallowedIfStrict":
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

  if (
    direction === "forward"
      ? domain.end.isBefore(position)
      : domain.start.isAfter(position)
  ) {
    return false;
  }

  if (
    disallowBehind &&
    (direction === "forward"
      ? domain.end.isEqual(position)
      : domain.start.isEqual(position))
  ) {
    return false;
  }

  if (mustStartBefore != null && !domain.start.isBefore(mustStartBefore)) {
    return false;
  }

  return true;
}
