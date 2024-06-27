import {
  Direction,
  Position,
  Range,
  SurroundingPairScopeType,
  TextEditor,
  type ScopeType,
} from "@cursorless/common";
import type { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import { SurroundingPairTarget } from "../../../targets";
import { BaseScopeHandler } from "../BaseScopeHandler";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";
import { compareTargetScopes } from "../compareTargetScopes";
import { TargetScope } from "../scope.types";
import { ScopeIteratorRequirements } from "../scopeHandler.types";
import { getDelimiterOccurrences } from "./getDelimiterOccurrences";
import { getDelimiterRegex } from "./getDelimiterRegex";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import { getSurroundingPairOccurrences } from "./getSurroundingPairOccurrences";
import type { SurroundingPairOccurrence } from "./types";

export class SurroundingPairScopeHandler extends BaseScopeHandler {
  public readonly iterationScopeType;
  protected isHierarchical = true;

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
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

    if (this.scopeType.forceDirection === "left") {
      // TODO: Better handling of this?
      throw Error(
        "forceDirection not supported. Use 'take previous pair' instead",
      );
    }

    const delimiterOccurrences = getDelimiterOccurrences(
      editor.document.getText(),
      individualDelimiters,
      delimiterRegex,
    );

    const languageDefinition = this.languageDefinitions.get(this.languageId);
    const matches = languageDefinition?.getMatches(editor.document) ?? [];

    const surroundingPairs = getSurroundingPairOccurrences(
      matches,
      individualDelimiters,
      delimiterOccurrences,
    );

    const positionOffset = editor.document.offsetAt(position);
    const { requireStrongContainment } = this.scopeType;

    const scopes: TargetScope[] = [];

    surroundingPairs.forEach((pair, i) => {
      if (direction === "forward") {
        if (pair.rightEnd < positionOffset) {
          return;
        }
        // In the case of (()|) don't yield the pair to the left
        if (pair.rightEnd === positionOffset && hints.skipAncestorScopes) {
          const nextPair = surroundingPairs[i + 1];
          if (nextPair != null && nextPair.leftStart < pair.leftStart) {
            return;
          }
        }
      } else {
        if (pair.leftStart > positionOffset) {
          return;
        }
      }
      if (requireStrongContainment && !stronglyContains(positionOffset, pair)) {
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

function createTargetScope(
  editor: TextEditor,
  pair: SurroundingPairOccurrence,
): TargetScope {
  const { document } = editor;
  const contentRange = new Range(
    document.positionAt(pair.leftStart),
    document.positionAt(pair.rightEnd),
  );
  const interiorRange = new Range(
    document.positionAt(pair.leftEnd),
    document.positionAt(pair.rightStart),
  );
  const leftRange = new Range(
    document.positionAt(pair.leftStart),
    document.positionAt(pair.leftEnd),
  );
  const rightRange = new Range(
    document.positionAt(pair.rightStart),
    document.positionAt(pair.rightEnd),
  );

  return {
    editor,
    domain: contentRange,
    getTargets: (isReversed) => [
      new SurroundingPairTarget({
        editor,
        isReversed,
        contentRange,
        interiorRange,
        boundary: [leftRange, rightRange],
      }),
    ],
  };
}

function stronglyContains(position: number, pair: SurroundingPairOccurrence) {
  return position >= pair.leftEnd && position <= pair.rightStart;
}
