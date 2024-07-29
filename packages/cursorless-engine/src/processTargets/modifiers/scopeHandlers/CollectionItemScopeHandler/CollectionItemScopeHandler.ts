import {
  Direction,
  Position,
  TextEditor,
  type ScopeType,
} from "@cursorless/common";
import type { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { compareTargetScopes } from "../compareTargetScopes";
import { TargetScope } from "../scope.types";
import { ScopeIteratorRequirements } from "../scopeHandler.types";
import { createTargetScope } from "../SurroundingPairScopeHandler/createTargetScope";
import { getDelimiterOccurrences } from "../SurroundingPairScopeHandler/getDelimiterOccurrences";
import { getIndividualDelimiters } from "../SurroundingPairScopeHandler/getIndividualDelimiters";
import {
  IndividualDelimiter,
  IndividualSeparator,
} from "../SurroundingPairScopeHandler/types";

export class CollectionItemScopeHandler extends BaseScopeHandler {
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
    const delimiterOccurrences = getDelimiterOccurrences<
      IndividualDelimiter | IndividualSeparator
    >(this.languageDefinitions.get(this.languageId), editor.document, [
      ...getIndividualDelimiters("collectionBoundary", this.languageId),
      { side: "separator", text: "," },
    ]);

    const surroundingPairs = getCollectionItemOccurrences(delimiterOccurrences);

    yield* surroundingPairs
      .map((pair) => createTargetScope(editor, pair))
      .sort((a, b) => compareTargetScopes(direction, position, a, b));
  }
}
