import { NoContainingScopeError } from "../../errors";
import { Target } from "../../typings/target.types";
import { RelativeScopeModifier } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getScopeHandler from "../getScopeHandler";
import { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { runLegacy } from "./relativeScopeLegacy";
import { Scope } from "./scopeHandlers/scopeHandler.types";
import { OutOfRangeError } from "./targetSequenceUtils";
import { TooFewScopesError } from "./TooFewScopesError";

export class RelativeScopeStage implements ModifierStage {
  constructor(private modifier: RelativeScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    switch (this.modifier.scopeType.type) {
      case "token":
        return this.runNew(target);
      default:
        return runLegacy(this.modifier, context, target);
    }
  }

  private runNew(target: Target): Target[] {
    return this.modifier.offset === 0
      ? this.handleIncludingIntersecting(target)
      : this.handleNotIncludingIntersecting(target);
  }

  private handleNotIncludingIntersecting(target: Target): Target[] {
    const {
      isReversed,
      editor,
      contentRange: { start, end },
    } = target;
    const { scopeType, length, direction, offset } = this.modifier;

    const scopeHandler = getScopeHandler(scopeType);

    const proximalScope = scopeHandler.getScopeRelativeToPosition(
      editor,
      direction === "forward" ? end : start,
      offset,
      direction
    );

    if (length === 1) {
      return [proximalScope.getTarget(isReversed)];
    }

    const distalScope = scopeHandler.getScopeRelativeToPosition(
      editor,
      direction === "forward"
        ? proximalScope.domain.end
        : proximalScope.domain.start,
      length - 1,
      direction
    );

    return constructScopeRangeTarget(isReversed, proximalScope, distalScope);
  }

  private handleIncludingIntersecting(target: Target): Target[] {
    const { isReversed, editor, contentRange: range } = target;
    const { start, end } = range;
    const { scopeType, length: desiredScopeCount, direction } = this.modifier;

    const scopeHandler = getScopeHandler(scopeType);

    const intersectingScopes = scopeHandler.getScopesIntersectingRange(
      editor,
      range
    );

    const intersectingScopeCount = intersectingScopes.length;

    if (intersectingScopeCount === 0) {
      throw new NoContainingScopeError(scopeType.type);
    }

    if (intersectingScopeCount > desiredScopeCount) {
      throw new TooFewScopesError(
        desiredScopeCount,
        intersectingScopeCount,
        scopeType.type
      );
    }

    const proximalScope =
      direction === "forward"
        ? intersectingScopes[0]
        : intersectingScopes.at(-1)!;

    let distalScope: Scope;

    if (desiredScopeCount > intersectingScopeCount) {
      const extraScopesNeeded = desiredScopeCount - intersectingScopeCount;

      const scopes = scopeHandler.getScopeRelativeToPosition(
        editor,
        direction === "forward" ? end : start,
        [extraScopesNeeded],
        direction
      );

      if (scopes == null) {
        throw new OutOfRangeError();
      }

      distalScope = scopes[0];
    } else {
      distalScope =
        direction === "forward"
          ? intersectingScopes.at(-1)!
          : intersectingScopes[0];
    }

    return constructScopeRangeTarget(isReversed, proximalScope, distalScope);
  }
}
