import { escapeRegExp, max, maxBy, sortedIndexBy, uniq, zip } from "lodash";
import { Position, Selection } from "vscode";
import { Point, SyntaxNode } from "web-tree-sitter";
import {
  Delimiter,
  DelimiterInclusion,
  NodeMatcher,
  NodeMatcherValue,
  SelectionWithEditor,
} from "../typings/Types";
import { matchAll } from "../util/regex";

function positionFromPoint(point: Point): Position {
  return new Position(point.row, point.column);
}

const delimiterToText: Record<Delimiter, string[]> = {
  squareBrackets: ["[", "]"],
  curlyBrackets: ["{", "}"],
  angleBrackets: ["<", ">"],
  parentheses: ["(", ")"],
  singleQuotes: ["'", "'"],
  doubleQuotes: ['"', '"'],
  backtickQuotes: ["`", "`"],
  whitespace: [" ", " "], // TODO: Fix this to handle tabs / newlines
  escapedSingleQuotes: ["\\'", "\\'"],
  escapedDoubleQuotes: ['\\"', '\\"'],
};

const leftToRightMap: Record<string, string> = Object.fromEntries(
  Object.values(delimiterToText)
);

/**
 * Delimiters to look for when the user does not specify a delimiter
 */
const anyDelimiter = Object.keys(delimiterToText).filter(
  (delimiter) => delimiter !== "whitespace"
);

export function createSurroundingPairMatcher(
  delimiter: Delimiter | null,
  delimiterInclusion: DelimiterInclusion
): NodeMatcher {
  return function nodeMatcher(
    selection: SelectionWithEditor,
    node: SyntaxNode
  ) {
    const delimitersToCheck = delimiter == null ? anyDelimiter : [delimiter];

    const leftDelimiterTypes = delimitersToCheck.map(
      (delimiter) => delimiterToText[delimiter][0]
    );

    const leftDelimiterNodes = node.children.filter(
      (child) =>
        leftDelimiterTypes.includes(child.type) &&
        positionFromPoint(child.startPosition).isBeforeOrEqual(
          selection.selection.start
        )
    );

    // TODO: Incorporate selection end like we're planning todo with the textual version

    if (leftDelimiterNodes.length === 0) {
      return null;
    }

    const leftDelimiterNode = leftDelimiterNodes[leftDelimiterNodes.length - 1];
    const rightDelimiterType = leftToRightMap[leftDelimiterNode.type];

    const rightDelimiterNode = node.children.find(
      (child) =>
        child.type === rightDelimiterType && child !== leftDelimiterNode
    );

    if (rightDelimiterNode == null) {
      return null;
    }

    return extractSelection(
      leftDelimiterNode,
      rightDelimiterNode,
      delimiterInclusion
    );
  };
}

function extractSelection(
  leftDelimiterNode: SyntaxNode,
  rightDelimiterNode: SyntaxNode,
  delimiterInclusion: DelimiterInclusion
): NodeMatcherValue[] {
  switch (delimiterInclusion) {
    case "includeDelimiters":
      return [
        {
          node: leftDelimiterNode,
          selection: {
            selection: new Selection(
              positionFromPoint(leftDelimiterNode.startPosition),
              positionFromPoint(rightDelimiterNode.endPosition)
            ),
            context: {},
          },
        },
      ];
    case "excludeDelimiters":
      return [
        {
          node: leftDelimiterNode,
          selection: {
            selection: new Selection(
              positionFromPoint(leftDelimiterNode.endPosition),
              positionFromPoint(rightDelimiterNode.startPosition)
            ),
            context: {},
          },
        },
      ];
    case "delimitersOnly":
      return [
        {
          node: leftDelimiterNode,
          selection: {
            selection: new Selection(
              positionFromPoint(leftDelimiterNode.startPosition),
              positionFromPoint(leftDelimiterNode.endPosition)
            ),
            context: {},
          },
        },
        {
          node: rightDelimiterNode,
          selection: {
            selection: new Selection(
              positionFromPoint(rightDelimiterNode.startPosition),
              positionFromPoint(rightDelimiterNode.endPosition)
            ),
            context: {},
          },
        },
      ];
  }
}

interface IndividualDelimiter {
  text: string;
  oppositeText: string;
  direction: "bidirectional" | "left" | "right";
  delimiter: Delimiter;
}

// (  (  )  )
// " " ""
// [[] []]
// "(<user.foo>   <user.bar>)"
// """"""
// ([)]
// \(\)
// """
// ()
// ()()
export function findSurroundingPairTextBased(
  text: string,
  startIndex: number,
  endIndex: number,
  delimiter: Delimiter | null,
  delimiterInclusion: DelimiterInclusion
): SelectionWithContext[] | null {
  const openDelimiterCount = 1;
  // TODO: Walk left and right from start of selection,
  // then walk left and right from end of selection;
  // If one selection contains the other, return the bigger one
  // If one does not contain the other, take their union and repeat
  const delimitersToCheck = delimiter == null ? anyDelimiter : [delimiter];

  const individualDelimiters: IndividualDelimiter[] = delimitersToCheck
    .map((delimiter) => {
      const [leftDelimiter, rightDelimiter] = delimiterToText[delimiter];

      if (leftDelimiter === rightDelimiter) {
        return [
          {
            text: leftDelimiter,
            oppositeText: leftDelimiter,
            direction: "bidirectional",
            delimiter,
          } as const,
        ];
      } else {
        return [
          {
            text: leftDelimiter,
            oppositeText: rightDelimiter,
            direction: "right",
            delimiter,
          } as const,
          {
            text: rightDelimiter,
            oppositeText: leftDelimiter,
            direction: "left",
            delimiter,
          } as const,
        ];
      }
    })
    .flat();

  const delimiterTaxToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ])
  );

  const delimiterRegex = new RegExp(
    uniq(individualDelimiters.flatMap(({ text }) => [`\\${text}`, text]))
      .map(escapeRegExp)
      .join("|"),
    "gu"
  );

  const delimiterMatches = matchAll(text, delimiterRegex, (match) => ({
    text: match[0],
    index: match.index!,
  }));

  if (startIndex === endIndex) {
    const selectionIndexMatchIndex = sortedIndexBy<{ index: number }>(
      delimiterMatches,
      { index: startIndex },
      "index"
    );
    const nextDelimiter = delimiterMatches[selectionIndexMatchIndex];
    if (nextDelimiter != null && nextDelimiter.index === startIndex) {
      const delimiterInfo = delimiterTaxToDelimiterInfoMap[nextDelimiter.text];
      const possibleMatch = findOppositeDelimiter(
        delimiterMatches,
        nextDelimiter.index,
        delimiterInfo
      );
      if (possibleMatch != null) {
        return possibleMatch;
      }
    }
    // TODO: Handle the case where it's the previous delimiter that we are
    // adjacent to
    // TODO: Handle the case where we have a non empty selection. In this case
    // we look for the smallest delimiter pair that weakly contains our
    // selection
  }
}

function findOppositeDelimiter(
  delimiterMatches: { text: string; index: number }[],
  index: number,
  delimiterInfo: IndividualDelimiter
) {
  throw new Error("Function not implemented.");
}
