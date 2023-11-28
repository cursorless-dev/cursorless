import {
  ComplexSurroundingPairName,
  Direction,
  Position,
  Range,
  ScopeType,
  SimpleSurroundingPairName,
  SurroundingPairScopeType,
  TextEditor,
  simpleSurroundingPairNames,
} from "@cursorless/common";
import { escapeRegExp, uniq } from "lodash";
import { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import { SurroundingPairTarget } from "../../../targets";
import { complexDelimiterMap } from "./delimiterMaps";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import { IndividualDelimiter } from "./types";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { TargetScope } from "../scope.types";
import { ScopeIteratorRequirements } from "../scopeHandler.types";

export class SurroundingPairScopeHandler extends BaseScopeHandler {
  // public readonly iterationScopeType;
  public readonly iterationScopeType: ScopeType = { type: "document" };

  protected isHierarchical = true;

  constructor(
    private languageDefinitions: LanguageDefinitions,
    public readonly scopeType: SurroundingPairScopeType,
    private languageId: string,
  ) {
    super();
    // this.iterationScopeType = this.scopeType;
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    _hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const { document } = editor;
    // this.languageDefinitions.get(this.languageId)?.getScopeHandler()

    const delimiters = complexDelimiterMap[
      this.scopeType.delimiter as ComplexSurroundingPairName
    ] ?? [this.scopeType.delimiter];
    const individualDelimiters = getIndividualDelimiters(delimiters);

    const delimiterTextToDelimiterInfoMap = Object.fromEntries(
      individualDelimiters.map((individualDelimiter) => [
        individualDelimiter.text,
        individualDelimiter,
      ]),
    );

    /**
     * Regex to use to find delimiters
     */
    const delimiterRegex = getDelimiterRegex(individualDelimiters);

    const matches = document.getText().matchAll(delimiterRegex);

    const offset = document.offsetAt(position);

    const pairCount: Record<
      SimpleSurroundingPairName,
      [number, IndividualDelimiter][]
    > = Object.fromEntries(simpleSurroundingPairNames.map((sp) => [sp, []]));

    for (const match of matches) {
      const delimiterInfo = delimiterTextToDelimiterInfoMap[match[0]];
      const indices = pairCount[delimiterInfo.delimiter];
      const side =
        delimiterInfo.side === "unknown"
          ? indices.length === 0
            ? "left"
            : "right"
          : delimiterInfo.side;

      if (side === "left") {
        indices.push([match.index!, delimiterInfo]);
      } else if (side === "right") {
        const startDelimiter = indices.pop();

        if (startDelimiter != null) {
          const leftDelimiterStartIndex = startDelimiter[0];
          const leftDelimiterEndIndex =
            startDelimiter[0] + startDelimiter[1].text.length;
          const rightDelimiterStartIndex = match.index!;
          const rightDelimiterEndIndex =
            match.index! + delimiterInfo.text.length;

          if (
            useScope(
              direction,
              offset,
              leftDelimiterStartIndex,
              leftDelimiterEndIndex,
              rightDelimiterStartIndex,
              rightDelimiterEndIndex,
              this.scopeType.requireStrongContainment,
            )
          ) {
            yield createsScope(
              editor,
              leftDelimiterStartIndex,
              leftDelimiterEndIndex,
              rightDelimiterStartIndex,
              rightDelimiterEndIndex,
            );
          }
        }
      }
      pairCount[delimiterInfo.delimiter] = indices;
    }
  }
}

function useScope(
  direction: Direction,
  offset: number,
  leftDelimiterStartIndex: number,
  leftDelimiterEndIndex: number,
  rightDelimiterStartIndex: number,
  rightDelimiterEndIndex: number,
  requireStrongContainment?: boolean,
): boolean {
  if (
    (direction === "forward" && rightDelimiterEndIndex < offset) ||
    leftDelimiterStartIndex > offset
  ) {
    return false;
  }

  if (requireStrongContainment) {
    if (offset < leftDelimiterEndIndex || offset > rightDelimiterStartIndex) {
      return false;
    }
  }

  return true;
}

function createsScope(
  editor: TextEditor,
  leftDelimiterStartIndex: number,
  leftDelimiterEndIndex: number,
  rightDelimiterStartIndex: number,
  rightDelimiterEndIndex: number,
): TargetScope {
  const { document } = editor;
  const leftDelimiterStart = document.positionAt(leftDelimiterStartIndex);
  const leftDelimiterEnd = document.positionAt(leftDelimiterEndIndex);
  const rightDelimiterStart = document.positionAt(rightDelimiterStartIndex);
  const rightDelimiterEnd = document.positionAt(rightDelimiterEndIndex);
  const range = new Range(leftDelimiterStart, rightDelimiterEnd);

  return {
    editor,
    domain: range,
    getTargets: (isReversed) => [
      new SurroundingPairTarget({
        editor,
        contentRange: range,
        isReversed,
        interiorRange: new Range(leftDelimiterEnd, rightDelimiterStart),
        boundary: [
          new Range(leftDelimiterStart, leftDelimiterEnd),
          new Range(rightDelimiterStart, rightDelimiterEnd),
        ],
      }),
    ],
  };
}

function getDelimiterRegex(individualDelimiters: IndividualDelimiter[]) {
  // Create a regex which is a disjunction of all possible left / right
  // delimiter texts
  const individualDelimiterDisjunct = uniq(
    individualDelimiters.map(({ text }) => text),
  )
    .map(escapeRegExp)
    .join("|");

  // Then make sure that we don't allow preceding `\`
  return new RegExp(`(?<!\\\\)(${individualDelimiterDisjunct})`, "gu");
}
