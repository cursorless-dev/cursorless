import type { Direction, Position, TextEditor } from "@cursorless/common";
import { type ScopeType } from "@cursorless/common";
import type { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import { BaseScopeHandler } from "../BaseScopeHandler";
import type { TargetScope } from "../scope.types";
import type { ScopeIteratorRequirements } from "../scopeHandler.types";

export class CollectionItemScopeHandler extends BaseScopeHandler {
  public scopeType: ScopeType = { type: "collectionItem" };
  protected isHierarchical = true;

  public readonly iterationScopeType: ScopeType = {
    type: "oneOf",
    scopeTypes: [
      { type: "line" },
      {
        type: "surroundingPairInterior",
        delimiter: "collectionBoundary",
      },
    ],
  };

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
    // return null;
  }
}
