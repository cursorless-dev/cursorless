import { NoContainingScopeError } from "../../errors";
import type { Target } from "../../typings/target.types";
import type {
  ContainingScopeModifier,
  Direction,
} from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import getScopeHandler from "./scopeHandlers/getScopeHandler";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import getLegacyScopeStage from "./getLegacyScopeStage";
import { TargetScope } from "./scopeHandlers/scope.types";
import { TextEditor, Position } from "vscode";
import { ScopeHandler } from "./scopeHandlers/scopeHandler.types";

/**
 * This modifier stage expands from the input target to the smallest containing
 * scope.  We proceed as follows:
 *
 * 1. Expand to smallest scope(s) touching start position of input target's
 *    content range
 * 2. If input target has an empty content range, return the start scope,
 *    breaking ties as defined by {@link getPreferredScope} when more than one
 *    scope touches content range
 * 3. Otherwise, if end of input target is weakly contained by the domain of the
 *    rightmost start scope, return rightmost start scope.  We return rightmost
 *    because that will have non-empty intersection with input target content
 *    range.
 * 4. Otherwise, expand from end of input target and form a range from rightmost
 *    start scope through leftmost end scope.  We use rightmost start scope and
 *    leftmost end scope because those will have non-empty intersection with
 *    input target content range.
 */
export class ContainingScopeStage implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const {
      isReversed,
      editor,
      contentRange: { start, end },
    } = target;
    const { scopeType, ancestorIndex = 0 } = this.modifier;

    const scopeHandler = getScopeHandler(
      scopeType,
      target.editor.document.languageId,
    );

    if (scopeHandler == null) {
      return getLegacyScopeStage(this.modifier).run(context, target);
    }

    if (end.isEqual(start)) {
      // Input target is empty; return the preferred scope touching target
      let scope = scopeHandler.getPreferredScopeTouchingPosition(editor, start);

      if (scope == null) {
        throw new NoContainingScopeError(this.modifier.scopeType.type);
      }

      if (ancestorIndex > 0) {
        scope = expandFromPosition(
          scopeHandler,
          editor,
          scope.domain.end,
          "forward",
          ancestorIndex - 1,
        );
      }

      if (scope == null) {
        throw new NoContainingScopeError(this.modifier.scopeType.type);
      }

      return [scope.getTarget(isReversed)];
    }

    const startScope = expandFromPosition(
      scopeHandler,
      editor,
      start,
      "forward",
      ancestorIndex,
    );

    if (startScope == null) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    if (startScope.domain.contains(end)) {
      return [startScope.getTarget(isReversed)];
    }

    const endScope = expandFromPosition(
      scopeHandler,
      editor,
      end,
      "backward",
      ancestorIndex,
    );

    if (endScope == null) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return [constructScopeRangeTarget(isReversed, startScope, endScope)];
  }
}

function expandFromPosition(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
  direction: Direction,
  ancestorIndex: number,
): TargetScope | undefined {
  let nextAncestorIndex = 0;
  for (const scope of scopeHandler.generateScopesRelativeToPosition(
    editor,
    position,
    direction,
    { containment: "required" },
  )) {
    if (scope.domain.contains(position)) {
      if (nextAncestorIndex === ancestorIndex) {
        return scope;
      }

      nextAncestorIndex += 1;
    }
  }

  return undefined;
}
