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
import type { Target } from "../../../typings/target.types";
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
        yield targetsToScope(targetRangeOpposite.distal, targetRange.distal);
        targetRangeOpposite = undefined;
      } else {
        yield targetsToScope(targetRange.proximal, targetRange.distal);
      }
    }
  }
}

function targetsToScope(
  leadingTarget: Target,
  trailingTarget: Target,
): TargetScope {
  if (leadingTarget.contentRange.isRangeEqual(trailingTarget.contentRange)) {
    return {
      editor: leadingTarget.editor,
      domain: leadingTarget.contentRange,
      getTargets: () => [leadingTarget],
    };
  }

  const range = leadingTarget.contentRange.union(trailingTarget.contentRange);
  return {
    editor: leadingTarget.editor,
    domain: range,
    getTargets: () => [leadingTarget.withContentRange(range)],
  };
}

function* generateTargetRangesInDirection(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
  direction: Direction,
): Iterable<{ proximal: Target; distal: Target }> {
  let proximal, distal: Target | undefined;

  const generator = scopeHandler.generateScopes(editor, position, direction, {
    allowAdjacentScopes: true,
    skipAncestorScopes: true,
  });

  for (const scope of generator) {
    for (const target of scope.getTargets(false)) {
      if (proximal == null) {
        proximal = target;
      }

      if (distal != null) {
        if (!isAdjacent(distal, target)) {
          yield { proximal, distal };
          proximal = target;
        }
      }

      distal = target;
    }
  }

  if (proximal != null && distal != null) {
    yield { proximal, distal };
  }
}

function isAdjacent(target1: Target, target2: Target): boolean {
  if (target1.contentRange.isRangeEqual(target2.contentRange)) {
    return true;
  }

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
