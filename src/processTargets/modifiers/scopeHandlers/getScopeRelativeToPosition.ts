import { Position, TextEditor } from "vscode";
import { Direction } from "../../../typings/targetDescriptor.types";
import { strictlyContains } from "../../../util/rangeUtils";
import { OutOfRangeError } from "../targetSequenceUtils";
import { TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

export default function getScopeRelativeToPosition(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
  offset: number,
  direction: Direction,
  strict: boolean,
): TargetScope {
  let scopeCount = 0;
  for (const scope of scopeHandler.generateScopes(editor, position, direction, {
    containment: strict ? "disallowed" : "disallowedIfStrict",
  })) {
    if (
      (strict && scope.domain.contains(position)) ||
      strictlyContains(scope.domain, position)
    ) {
      continue;
    }

    scopeCount += 1;

    if (scopeCount === offset) {
      return scope;
    }
  }

  throw new OutOfRangeError();
}
