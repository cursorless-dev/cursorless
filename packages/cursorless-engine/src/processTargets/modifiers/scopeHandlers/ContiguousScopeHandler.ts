import {
  Direction,
  Position,
  Range,
  ScopeType,
  TextEditor,
  next,
} from "@cursorless/common";
import { Target } from "../../../typings/target.types";
import { ensureSingleTarget } from "../../../util/targetUtils";
import { constructScopeRangeTarget } from "../constructScopeRangeTarget";
import { BaseScopeHandler } from "./BaseScopeHandler";
import type { TargetScope } from "./scope.types";
import type {
  CustomScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";

export class ContiguousScopeHandler extends BaseScopeHandler {
  protected readonly isHierarchical = false;

  constructor(private scopeHandler: ScopeHandler) {
    super();
  }

  get scopeType(): ScopeType | undefined {
    return this.scopeHandler.scopeType;
  }

  get iterationScopeType(): ScopeType | CustomScopeType {
    return this.scopeHandler.iterationScopeType;
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    _hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    let targetRangeOpposite = next(
      generateTargetRangesInDirection(
        this.scopeHandler,
        editor,
        position,
        direction === "forward" ? "backward" : "forward",
      ),
    );

    const targetRangesIter = generateTargetRangesInDirection(
      this.scopeHandler,
      editor,
      position,
      direction,
    );

    for (const targetRange of targetRangesIter) {
      if (
        targetRangeOpposite != null &&
        isAdjacent(targetRangeOpposite.proximal, targetRange.proximal)
      ) {
        yield combineScopes(targetRangeOpposite.distal, targetRange.distal);
        targetRangeOpposite = undefined;
      } else {
        yield combineScopes(targetRange.proximal, targetRange.distal);
      }
    }
  }
}

function combineScopes(scope1: TargetScope, scope2: TargetScope): TargetScope {
  if (scope1.domain.isRangeEqual(scope2.domain)) {
    return scope1;
  }

  return {
    editor: scope1.editor,
    domain: scope1.domain.union(scope2.domain),
    getTargets: (isReversed) => {
      return constructScopeRangeTarget(isReversed, scope1, scope2);
    },
  };
}

function* generateTargetRangesInDirection(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
  direction: Direction,
): Iterable<{ proximal: TargetScope; distal: TargetScope }> {
  let proximal, distal: TargetScope | undefined;

  const generator = scopeHandler.generateScopes(editor, position, direction, {
    allowAdjacentScopes: true,
    skipAncestorScopes: true,
  });

  for (const scope of generator) {
    if (proximal == null) {
      proximal = scope;
    }

    if (distal != null) {
      if (!isAdjacent(distal, scope)) {
        yield { proximal, distal };
        proximal = scope;
      }
    }

    distal = scope;
  }

  if (proximal != null && distal != null) {
    yield { proximal, distal };
  }
}

function isAdjacent(scope1: TargetScope, scope2: TargetScope): boolean {
  if (!scope1.contiguous || !scope2.contiguous) {
    return false;
  }

  if (scope1.domain.isRangeEqual(scope2.domain)) {
    return true;
  }

  const [startTarget, endTarget] = getTargetsInDocumentOrder(
    ensureSingleTarget(scope1.getTargets(false)),
    ensureSingleTarget(scope2.getTargets(false)),
  );

  const leadingRange =
    startTarget.getTrailingDelimiterTarget()?.contentRange ??
    startTarget.contentRange;
  const trailingRange =
    endTarget.getLeadingDelimiterTarget()?.contentRange ??
    endTarget.contentRange;

  if (leadingRange.intersection(trailingRange) != null) {
    return true;
  }

  // Non line targets are excluded if they are separated by more than one line
  if (
    !startTarget.isLine &&
    trailingRange.start.line - leadingRange.end.line > 1
  ) {
    return false;
  }

  // Finally targets are excluded if there is non whitespace text between them
  const rangeBetween = new Range(leadingRange.end, trailingRange.start);
  const text = startTarget.editor.document.getText(rangeBetween);
  return /^\s*$/.test(text);
}

function getTargetsInDocumentOrder(
  target1: Target,
  target2: Target,
): [Target, Target] {
  return target1.contentRange.start.isBefore(target2.contentRange.start)
    ? [target1, target2]
    : [target2, target1];
}
