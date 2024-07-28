import {
  Direction,
  Position,
  ScopeType,
  TextEditor,
  type Range,
} from "@cursorless/common";
import type { Target } from "../../../typings/target.types";
import { TokenTarget } from "../../targets";
import { BaseScopeHandler } from "./BaseScopeHandler";
import { compareTargetScopes } from "./compareTargetScopes";
import type { TargetScope } from "./scope.types";
import type {
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";

export class BoundedNonWhitespaceSequenceScopeHandler extends BaseScopeHandler {
  public readonly scopeType = { type: "boundedNonWhitespaceSequence" } as const;
  public readonly iterationScopeType: ScopeType = {
    type: "line",
  } as const;
  protected readonly isHierarchical = true;

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    _scopeType: ScopeType,
    private languageId: string,
  ) {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const paintScopeHandler = this.scopeHandlerFactory.create(
      {
        type: "nonWhitespaceSequence",
      },
      this.languageId,
    )!;

    const surroundingPairScopeHandler = this.scopeHandlerFactory.create(
      {
        type: "surroundingPair",
        delimiter: "any",
        requireStrongContainment: true,
      },
      this.languageId,
    )!;

    const paintScopes = paintScopeHandler.generateScopes(
      editor,
      position,
      direction,
      hints,
    );

    const scopes = Array.from(paintScopes)
      .flatMap((scope) => {
        const target = assertSingleTarget(scope);
        const pairInteriors = getSurroundingPairInteriors(
          surroundingPairScopeHandler,
          target,
        );
        const result = [scope];

        for (const pairInterior of pairInteriors) {
          const intersection = target.contentRange.intersection(pairInterior);
          if (intersection != null && !intersection.isEmpty) {
            result.push(createTargetScope(editor, intersection));
          }
        }

        return result;
      })
      .sort((a, b) => compareTargetScopes(direction, position, a, b));

    yield* scopes;
  }
}

function getSurroundingPairInteriors(
  surroundingPairScopeHandler: ScopeHandler,
  target: Target,
): Range[] {
  const surroundingPairScopes = surroundingPairScopeHandler.generateScopes(
    target.editor,
    target.contentRange.start,
    "forward",
    {
      distalPosition: target.contentRange.end,
    },
  );
  return Array.from(surroundingPairScopes).map(
    (scope) => assertSingleTarget(scope).getInterior()![0].contentRange,
  );
}

function assertSingleTarget(scope: TargetScope): Target {
  const targets = scope.getTargets(false);
  if (targets.length !== 1) {
    throw Error("Expected one target from a scope");
  }
  return targets[0];
}

function createTargetScope(
  editor: TextEditor,
  contentRange: Range,
): TargetScope {
  return {
    editor,
    domain: contentRange,
    getTargets: (isReversed) => [
      new TokenTarget({
        editor,
        isReversed,
        contentRange,
      }),
    ],
  };
}
