import {
  Direction,
  Position,
  Range,
  SurroundingPairScopeType,
  TextEditor,
} from "@cursorless/common";
import { SurroundingPairTarget } from "../../../targets";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { TargetScope } from "../scope.types";
import { ScopeIteratorRequirements } from "../scopeHandler.types";
import { getDelimiterOccurrences } from "./getDelimiterOccurrences";
import { getDelimiterRegex } from "./getDelimiterRegex";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import { getSurroundingPairOccurrences } from "./getSurroundingPairOccurrences";

export class SurroundingPairScopeHandler extends BaseScopeHandler {
  public readonly iterationScopeType;

  protected isHierarchical = true;

  constructor(
    public readonly scopeType: SurroundingPairScopeType,
    private languageId: string,
  ) {
    super();
    this.iterationScopeType = this.scopeType;
  }

  *generateScopeCandidates(
    editor: TextEditor,
    _position: Position,
    _direction: Direction,
    _hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const individualDelimiters = getIndividualDelimiters(
      this.scopeType.delimiter,
      this.languageId,
    );
    const delimiterRegex = getDelimiterRegex(individualDelimiters);
    const { document } = editor;

    // TODO: Use this
    // const { forceDirection } = this.scopeType;

    const delimiterOccurrences = getDelimiterOccurrences(
      document.getText(),
      individualDelimiters,
      delimiterRegex,
    );

    const surroundingPairs = getSurroundingPairOccurrences(
      individualDelimiters,
      delimiterOccurrences,
    );

    for (const pair of surroundingPairs) {
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

      yield {
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
  }
}
