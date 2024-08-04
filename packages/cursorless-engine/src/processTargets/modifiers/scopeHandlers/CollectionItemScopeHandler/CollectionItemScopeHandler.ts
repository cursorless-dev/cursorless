import type { Direction, Position, TextEditor } from "@cursorless/common";
import { Range, type ScopeType } from "@cursorless/common";
import type { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import { ScopeTypeTarget } from "../../../targets";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { compareTargetScopes } from "../compareTargetScopes";
import type { TargetScope } from "../scope.types";
import type { ScopeIteratorRequirements } from "../scopeHandler.types";
import { getDelimiterOccurrences } from "../SurroundingPairScopeHandler/getDelimiterOccurrences";
import { getIndividualDelimiters } from "../SurroundingPairScopeHandler/getIndividualDelimiters";
import type {
  CollectionItemOccurrence,
  IndividualDelimiter,
  IndividualSeparator,
} from "../SurroundingPairScopeHandler/types";
import { getCollectionItemOccurrences } from "./getCollectionItemOccurrences";

export class CollectionItemScopeHandler extends BaseScopeHandler {
  public scopeType: ScopeType = { type: "collectionItem" };

  public readonly iterationScopeType: ScopeType = {
    type: "oneOf",
    scopeTypes: [
      { type: "line" },
      {
        type: "surroundingPairInterior",
        delimiter: "any",
      },
    ],
  };
  protected isHierarchical = true;

  constructor(
    private languageDefinitions: LanguageDefinitions,
    private languageId: string,
  ) {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    _hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const delimiterOccurrences = getDelimiterOccurrences(
      this.languageDefinitions.get(this.languageId),
      editor.document,
      this.getIndividualDelimiters(),
    );

    const surroundingPairs = getCollectionItemOccurrences(delimiterOccurrences);

    yield* surroundingPairs
      .map((pair) => createTargetScope(editor, pair))
      .sort((a, b) => compareTargetScopes(direction, position, a, b));
  }

  private getIndividualDelimiters(): (
    | IndividualDelimiter
    | IndividualSeparator
  )[] {
    return [
      ...getIndividualDelimiters("collectionBoundary", this.languageId),
      { side: "separator", text: "," },
    ];
  }
}

function createTargetScope(
  editor: TextEditor,
  pair: CollectionItemOccurrence,
): TargetScope {
  const contentRange = new Range(
    pair.openingDelimiterRange.start,
    pair.closingDelimiterRange.end,
  );
  return {
    editor,
    domain: contentRange,
    getTargets(isReversed) {
      return [
        new ScopeTypeTarget({
          scopeTypeType: "collectionItem",
          editor,
          isReversed,
          contentRange,
          insertionDelimiter: ", ",
          //   leadingDelimiterRange: pair.leadingDelimiterRange,
          //   trailingDelimiterRange: pair.trailingDelimiterRange,
          //   removalRange: pair.removalRange,
        }),
      ];
    },
  };
}
