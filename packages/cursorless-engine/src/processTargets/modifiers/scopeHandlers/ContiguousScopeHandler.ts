import {
  ContiguousScopeType,
  Direction,
  Position,
  Range,
  ScopeType,
  TextEditor,
  next,
} from "@cursorless/common";
import { ScopeHandlerFactory } from ".";
import { createContinuousRangeTarget } from "../../createContinuousRangeTarget";
import { BaseScopeHandler } from "./BaseScopeHandler";
import type { TargetScope } from "./scope.types";
import type {
  CustomScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";

export class ContiguousScopeHandler extends BaseScopeHandler {
  protected readonly isHierarchical = false;
  private readonly scopeHandler: ScopeHandler;

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    public scopeType: ContiguousScopeType,
    languageId: string,
  ) {
    super();
    const handler = scopeHandlerFactory.create(scopeType.scopeType, languageId);
    if (handler == null) {
      throw new Error(
        `No available scope handler for '${scopeType.scopeType.type}'`,
      );
    }
    this.scopeHandler = handler;
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
      const target1 = scope1.getTargets(isReversed)[0];
      const target2 = scope2.getTargets(isReversed)[0];

      const [startTarget, endTarget] = target1.contentRange.start.isBefore(
        target2.contentRange.start,
      )
        ? [target1, target2]
        : [target2, target1];

      return [
        createContinuousRangeTarget(
          isReversed,
          startTarget,
          endTarget,
          true,
          true,
        ),
      ];
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
  if (scope1.domain.isRangeEqual(scope2.domain)) {
    return true;
  }

  const target1 = scope1.getTargets(false)[0];
  const target2 = scope2.getTargets(false)[0];

  const [leadingTarget, trailingTarget] = target1.contentRange.start.isBefore(
    target2.contentRange.start,
  )
    ? [target1, target2]
    : [target2, target1];

  const leadingRange =
    leadingTarget.getTrailingDelimiterTarget()?.contentRange ??
    leadingTarget.contentRange;
  const trailingRange =
    trailingTarget.getLeadingDelimiterTarget()?.contentRange ??
    trailingTarget.contentRange;

  if (leadingRange.intersection(trailingRange) != null) {
    return true;
  }

  if (
    !leadingTarget.isLine &&
    trailingRange.start.line - leadingRange.end.line > 1
  ) {
    return false;
  }

  const rangeBetween = new Range(leadingRange.end, trailingRange.start);
  const text = leadingTarget.editor.document.getText(rangeBetween);
  return /^\s*$/.test(text);
}
