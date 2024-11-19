import {
  NoContainingScopeError,
  testRegex,
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
import { delimiterRegex } from "./getDelimiterOccurrences";

export class CollectionItemIterationScopeHandler extends BaseScopeHandler {
  public scopeType: ScopeType = { type: "collectionItem" };
  protected isHierarchical = true;

  private readonly surroundingPairInteriorScopeHandler: ScopeHandler;

  get iterationScopeType(): CustomScopeType {
    throw new NoContainingScopeError(
      "Iteration scope for CollectionItemIterationScopeHandler",
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

    const lineScope = makeLineScope(editor, position);

    if (lineScope != null) {
      yield lineScope;
    }
  }
}

function makeLineScope(
  editor: TextEditor,
  position: Position,
): TargetScope | null {
  const contentRange = editor.document.lineAt(position.line).range;
  const text = editor.document.getText(contentRange);

  if (!testRegex(delimiterRegex, text)) {
    return null;
  }

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
