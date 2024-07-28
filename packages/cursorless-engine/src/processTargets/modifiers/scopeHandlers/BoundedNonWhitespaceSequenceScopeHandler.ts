import { Direction, Position, ScopeType, TextEditor } from "@cursorless/common";
import { BaseScopeHandler } from "./BaseScopeHandler";
import type { TargetScope } from "./scope.types";
import type { ScopeIteratorRequirements } from "./scopeHandler.types";
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
    const scopeHandler = this.scopeHandlerFactory.create(
      {
        type: "oneOf",
        scopeTypes: [
          { type: "nonWhitespaceSequence" },
          {
            type: "surroundingPairInterior",
            delimiter: "any",
          },
        ],
      },
      this.languageId,
    )!;

    yield* scopeHandler.generateScopes(editor, position, direction, hints);
  }
}
