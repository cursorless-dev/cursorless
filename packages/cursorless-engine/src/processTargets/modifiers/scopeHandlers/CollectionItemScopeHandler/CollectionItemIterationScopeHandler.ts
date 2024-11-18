import {
  type Direction,
  type Position,
  type ScopeType,
  type TextEditor,
} from "@cursorless/common";
import { LineTarget } from "../../../targets";
import { BaseScopeHandler } from "../BaseScopeHandler";
import type { TargetScope } from "../scope.types";
import type {
  CustomScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";

export class CollectionItemIterationScopeHandler extends BaseScopeHandler {
  public scopeType: ScopeType = { type: "collectionItem" };
  protected isHierarchical = true;

  private readonly surroundingPairInteriorScopeHandler: ScopeHandler;

  get iterationScopeType(): CustomScopeType {
    throw Error(
      "Iteration scope doesn't exist for CollectionItemIterationScopeHandler",
    );
  }

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private languageId: string,
  ) {
    super();

    this.surroundingPairInteriorScopeHandler = this.scopeHandlerFactory.create(
      {
        type: "surroundingPairInterior",
        delimiter: "collectionBoundary",
      },
      this.languageId,
    )!;
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const scopes = this.surroundingPairInteriorScopeHandler.generateScopes(
      editor,
      position,
      direction,
      hints,
    );

    yield* scopes;

    yield makeLineScope(editor, position);
  }
}

function makeLineScope(editor: TextEditor, position: Position): TargetScope {
  const contentRange = editor.document.lineAt(position.line).range;
  return {
    editor,
    domain: contentRange,
    getTargets(isReversed) {
      return [
        new LineTarget({
          editor,
          contentRange,
          isReversed,
        }),
      ];
    },
  };
}
