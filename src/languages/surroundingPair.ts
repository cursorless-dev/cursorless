import { max, maxBy, zip } from "lodash";
import { Position, Selection } from "vscode";
import { Point, SyntaxNode } from "web-tree-sitter";
import {
  Delimiter,
  DelimiterInclusion,
  NodeMatcher,
  NodeMatcherValue,
  SelectionWithEditor,
} from "../typings/Types";

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

// (  (  )  )

// " " ""
// [[] []]
// "(<user.foo>   <user.bar>)"

interface IndividualDelimiter {
  text: string;
  oppositeText: string;
  direction: "bidirectional" | "left" | "right";
  delimiter: Delimiter;
}

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

  const startSurroundingPair = findSurroundingPairFromPosition(
    individualDelimiters,
    text,
    startIndex
  );
}

interface DelimiterPosition {
  delimiter: IndividualDelimiter;
  index: number;
}

// \(\)
// """
// ()
// ()()
function generateDelimitersAtPosition(
  individualDelimiters: IndividualDelimiter[],
  text: string,
  index: number
) {
  // TODO: Let https://github.com/pokey/cursorless-vscode/issues/311 handle
  // this case, and instead just always assume that we will have the delimiter
  // selected as our entire range in the case that we would have been sitting
  // on a delimiter
  const maxDelimiterLength = max(
    individualDelimiters.map(({ text }) => text.length)
  )!;
  const matchingDelimiters: DelimiterPosition[] = [];
  for (let i = index; i >= index - maxDelimiterLength; i--) {
    for (const delimiter of individualDelimiters) {
      if (
        text.substring(i, i + maxDelimiterLength).startsWith(delimiter.text) &&
        i + delimiter.text.length >= index
      ) {
        matchingDelimiters.push({
          delimiter,
          index,
        });
      }
    }
  }

  matchingDelimiters.sort((delimiter1, delimiter2) => {
    const delimiter1Length = delimiter1.delimiter.text.length;
    const delimiter2Length = delimiter2.delimiter.text.length;
    const delimiter1RightIndex = delimiter1.index + delimiter1Length;
    const delimiter2RightIndex = delimiter2.index + delimiter2Length;

    if (delimiter1RightIndex === delimiter2RightIndex) {
      return delimiter2Length - delimiter1Length;
    }

    return delimiter2RightIndex - delimiter1RightIndex;
  });

  return matchingDelimiters;
}

function findSurroundingPairFromPosition(
  individualDelimiters: IndividualDelimiter[],
  text: string,
  startIndex: number
) {
  throw new Error("Function not implemented.");
}
