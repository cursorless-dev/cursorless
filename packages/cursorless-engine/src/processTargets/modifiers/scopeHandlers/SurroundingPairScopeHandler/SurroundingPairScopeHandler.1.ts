import {
  Direction,
  Position,
  Range,
  SurroundingPairScopeType,
  TextEditor,
} from "@cursorless/common";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { TargetScope } from "../scope.types";
import { ScopeIteratorRequirements } from "../scopeHandler.types";
import { getDelimiterRegex } from "./getDelimiterRegex";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import type { DelimiterOccurrence } from "./types";
import { getDelimiterOccurrences } from "./getDelimiterOccurrences";

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

  generateScopeCandidates(
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
    const text = document.getText();

    // TODO: Use this
    // const { forceDirection } = this.scopeType;
    const delimiterOccurrences = getDelimiterOccurrences(
      text,
      individualDelimiters,
      delimiterRegex,
    );

    const openDelimiters = new Map<string, DelimiterOccurrence[]>(
      individualDelimiters.map((individualDelimiter) => [
        individualDelimiter.delimiter,
        [],
      ]),
    );

    const ranges: Range[] = [];

    for (const occurrence of delimiterOccurrences) {
      // TODO: Use Tree sitter to disqualify delimiter occurrences
      const side: "left" | "right" = (() => {
        if (occurrence.side === "unknown") {
          return openDelimiters.get(occurrence.delimiter)!.length % 2 === 0
            ? "left"
            : "right";
        }
        return occurrence.side;
      })();

      if (side === "left") {
        openDelimiters.get(occurrence.delimiter)!.push(occurrence);
      } else {
        const openDelimiter = openDelimiters.get(occurrence.delimiter)!.pop();
        if (openDelimiter == null) {
          continue;
        }
        ranges.push(
          new Range(
            document.positionAt(openDelimiter.start),
            document.positionAt(occurrence.end),
          ),
        );
      }
    }

    throw new Error("Method not implemented.");
  }
}
