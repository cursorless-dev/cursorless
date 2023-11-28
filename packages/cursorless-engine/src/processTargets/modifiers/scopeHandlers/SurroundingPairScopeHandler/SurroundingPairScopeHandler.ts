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
          const startIndex = startDelimiter[0];
          const endIndex = match.index! + delimiterInfo.text.length;
          if (
            (direction === "forward" && endIndex >= offset) ||
            startIndex <= offset
          ) {
            yield createsScope(
              editor,
              startDelimiter[0],
              startDelimiter[1],
              match.index!,
              delimiterInfo,
            );
          }
        }
      }
      pairCount[delimiterInfo.delimiter] = indices;
    }
  }
}

function createsScope(
  editor: TextEditor,
  startIndex: number,
  startDelimiter: IndividualDelimiter,
  endIndex: number,
  endDelimiter: IndividualDelimiter,
): TargetScope {
  const { document } = editor;
  const startOuter = document.positionAt(startIndex);
  const startInner = document.positionAt(
    startIndex + startDelimiter.text.length,
  );
  const endInner = document.positionAt(endIndex);
  const endOuter = document.positionAt(endIndex + endDelimiter.text.length);
  const range = new Range(startOuter, endOuter);

  return {
    editor,
    domain: range,
    getTargets: (isReversed) => [
      new SurroundingPairTarget({
        editor,
        contentRange: range,
        isReversed,
        interiorRange: new Range(startInner, endInner),
        boundary: [
          new Range(startOuter, startInner),
          new Range(endInner, endOuter),
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
