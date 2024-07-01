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

    if (this.scopeType.forceDirection != null) {
      // TODO: Better handling of this?
      throw Error(
        "forceDirection not supported. Use 'next pair' or 'previous pair' instead",
      );
    }

    const delimiterOccurrences = getDelimiterOccurrences(
      editor.document,
      individualDelimiters,
      delimiterRegex,
    );

    const surroundingPairs = getSurroundingPairOccurrences(
      this.getDisqualifiedDelimiterScopes(editor),
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

  private getDisqualifiedDelimiterScopes(editor: TextEditor): TargetScope[] {
    const languageDefinition = this.languageDefinitions.get(this.languageId);
    const handler = languageDefinition?.getScopeHandler({
      type: "disqualifyDelimiter",
    });
    if (handler == null) {
      return [];
    }
    return Array.from(
      handler.generateScopes(editor, new Position(0, 0), "forward"),
    );
  }

  isPreferredOver(
    scopeA: TargetScope,
    scopeB: TargetScope,
    position: Position,
  ): boolean | undefined {
    // In the case of `( [ )| ]` we prefer the one we're actually touching
    if (
      scopeA.domain.end.isEqual(position) &&
      !scopeB.domain.start.isEqual(position)
    ) {
      return true;
    }
    return undefined;
  }
}

function createTargetScope(
  editor: TextEditor,
  pair: SurroundingPairOccurrence,
): TargetScope {
  const contentRange = new Range(pair.leftStart, pair.rightEnd);
  const interiorRange = new Range(pair.leftEnd, pair.rightStart);
  const leftRange = new Range(pair.leftStart, pair.leftEnd);
  const rightRange = new Range(pair.rightStart, pair.rightEnd);

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

function stronglyContains(position: Position, pair: SurroundingPairOccurrence) {
  return (
    position.isAfterOrEqual(pair.leftEnd) &&
    position.isBeforeOrEqual(pair.rightStart)
  );
}
