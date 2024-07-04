import {
  Direction,
  Position,
  SurroundingPairScopeType,
  TextEditor,
  showError,
  type ScopeType,
} from "@cursorless/common";
import type { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { compareTargetScopes } from "../compareTargetScopes";
import { TargetScope } from "../scope.types";
import { ScopeIteratorRequirements } from "../scopeHandler.types";
import { getDelimiterOccurrences } from "./getDelimiterOccurrences";
import { getDelimiterRegex } from "./getDelimiterRegex";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import { getSurroundingPairOccurrences } from "./getSurroundingPairOccurrences";
import { ide } from "../../../../singletons/ide.singleton";
import { createTargetScope } from "./createTargetScope";
import { stronglyContains } from "./stronglyContains";

export class SurroundingPairScopeHandler extends BaseScopeHandler {
  public readonly iterationScopeType;
  protected isHierarchical = true;

  constructor(
    private languageDefinitions: LanguageDefinitions,
    public readonly scopeType: SurroundingPairScopeType,
    private languageId: string,
  ) {
    super();
    const iterationScopeType: ScopeType = {
      type: "oneOf",
      scopeTypes: [this.scopeType, { type: "document" }],
    };
    this.iterationScopeType = iterationScopeType;
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const individualDelimiters = getIndividualDelimiters(
      this.scopeType.delimiter,
      this.languageId,
    );
    const delimiterRegex = getDelimiterRegex(individualDelimiters);

    if (this.scopeType.forceDirection != null) {
      //  DEPRECATED @ 2024-07-01
      void showError(
        ide().messages,
        "deprecatedForceDirection",
        "forceDirection not supported. Use 'next pair' or 'previous pair' instead",
      );
      return;
    }

    const delimiterOccurrences = getDelimiterOccurrences(
      this.languageDefinitions.get(this.languageId),
      editor.document,
      individualDelimiters,
      delimiterRegex,
    );

    const surroundingPairs = getSurroundingPairOccurrences(
      individualDelimiters,
      delimiterOccurrences,
    );

    const { requireStrongContainment } = this.scopeType;

    const scopes: TargetScope[] = [];

    surroundingPairs.forEach((pair, i) => {
      if (direction === "forward") {
        if (pair.rightEnd.isBefore(position)) {
          return;
        }
        // In the case of `(()|)` don't yield the pair to the left
        if (pair.rightEnd.isEqual(position) && hints.skipAncestorScopes) {
          const nextPair = surroundingPairs[i + 1];
          if (nextPair != null && nextPair.rightStart.isEqual(position)) {
            return;
          }
        }
      } else {
        if (pair.leftStart.isAfter(position)) {
          return;
        }
      }
      if (requireStrongContainment && !stronglyContains(position, pair)) {
        return;
      }
      scopes.push(createTargetScope(editor, pair));
    });

    scopes.sort((a, b) => compareTargetScopes(direction, position, a, b));

    for (const scope of scopes) {
      yield scope;
    }
  }
}
