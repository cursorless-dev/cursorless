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
import { Target } from "../../../typings/target.types";
import { BaseScopeHandler } from "./BaseScopeHandler";
import type { TargetScope } from "./scope.types";
import { CustomScopeType, ScopeHandler } from "./scopeHandler.types";

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

  generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
  ): Iterable<TargetScope> {
    return direction === "backward"
      ? this.generateScopeCandidatesBackward(editor, position)
      : this.generateScopeCandidatesForward(editor, position);
  }

  *generateScopeCandidatesBackward(
    editor: TextEditor,
    position: Position,
  ): Iterable<TargetScope> {
    const targetsForward = next(
      getTargetsInDirection(this.scopeHandler, editor, position, "forward"),
    );

    const targetsBackward = getTargetsInDirection(
      this.scopeHandler,
      editor,
      position,
      "backward",
    );

    for (const targets of targetsBackward) {
      if (targetsForward != null && isAdjacent(targets[1], targetsForward[0])) {
        yield targetsToScope(targets[0], targetsForward[1]);
      } else {
        yield targetsToScope(...targets);
      }
    }
  }

  *generateScopeCandidatesForward(
    editor: TextEditor,
    position: Position,
  ): Iterable<TargetScope> {
    const targetsBackward = next(
      getTargetsInDirection(this.scopeHandler, editor, position, "backward"),
    );

    const targetsForward = getTargetsInDirection(
      this.scopeHandler,
      editor,
      position,
      "forward",
    );

    for (const targets of targetsForward) {
      if (
        targetsBackward != null &&
        isAdjacent(targetsBackward[1], targets[0])
      ) {
        yield targetsToScope(targetsBackward[0], targets[1]);
      } else {
        yield targetsToScope(...targets);
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

function* getTargetsInDirection(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
  direction: Direction,
): Iterable<[Target, Target]> {
  const isForward = direction === "forward";
  let first, last: Target | undefined;

  const generator = scopeHandler.generateScopes(editor, position, direction, {
    allowAdjacentScopes: true,
    skipAncestorScopes: true,
  });

  for (const scope of generator) {
    for (const target of scope.getTargets(false)) {
      if (first == null) {
        first = target;
      }

      if (last != null) {
        const [leadingTarget, trailingTarget] = isForward
          ? [last, target]
          : [target, last];

        if (!isAdjacent(leadingTarget, trailingTarget)) {
          yield isForward ? [first, last] : [last, first];
          first = target;
          last = undefined;
        }
      }

      last = target;
    }
  }

  if (first != null && last != null) {
    yield isForward ? [first, last] : [last, first];
  }
}

function isAdjacent(leadingTarget: Target, trailingTarget: Target): boolean {
  if (
    leadingTarget.contentRange.intersection(trailingTarget.contentRange) != null
  ) {
    return true;
  }

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
