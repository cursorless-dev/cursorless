import {
  Direction,
  Position,
  Range,
  SurroundingPairScopeType,
  TextEditor,
  type ScopeType,
} from "@cursorless/common";
import { SurroundingPairTarget } from "../../../targets";
import { BaseScopeHandler } from "../BaseScopeHandler";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";
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
    _hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const individualDelimiters = getIndividualDelimiters(
      this.scopeType.delimiter,
      this.languageId,
    );
    const delimiterRegex = getDelimiterRegex(individualDelimiters);

    if (this.scopeType.forceDirection != null) {
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

    const surroundingPairs = getSurroundingPairOccurrences(
      individualDelimiters,
      delimiterOccurrences,
    );

    const positionOffset = editor.document.offsetAt(position);

    for (let i = 0; i < surroundingPairs.length; ++i) {
      const pair = surroundingPairs[i];

      if (direction === "forward") {
        if (pair.rightEnd < positionOffset) {
          continue;
        }
        if (
          pair.rightEnd === positionOffset &&
          surroundingPairs[i + 1]?.rightStart === positionOffset
        ) {
          continue;
        }
      } else {
        if (pair.leftStart > positionOffset) {
          continue;
        }
      }

      yield createTargetScope(editor, pair);
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
