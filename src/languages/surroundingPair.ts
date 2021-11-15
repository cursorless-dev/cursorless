import { escapeRegExp, range, sortedIndexBy, uniq } from "lodash";
import { Position, Range, Selection, TextDocument, TextEditor } from "vscode";
import { Point, SyntaxNode } from "web-tree-sitter";
import {
  Delimiter,
  DelimiterInclusion,
  NodeMatcher,
  NodeMatcherValue,
  SelectionWithContext,
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

    return extractSelectionFromNode(
      leftDelimiterNode,
      rightDelimiterNode,
      delimiterInclusion
    );
  };
}

function extractSelectionFromNode(
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

export function findSurroundingPairTextBased(
  editor: TextEditor,
  selection: Selection,
  allowableRange: Range | null,
  delimiter: Delimiter | null,
  delimiterInclusion: DelimiterInclusion
) {
  const document: TextDocument = editor.document;

  const allowableRangeStartOffset =
    allowableRange == null ? 0 : document.offsetAt(allowableRange.start);

  const pairIndices = findSurroundingPairInText(
    document.getText(allowableRange ?? undefined),
    document.offsetAt(selection.start) - allowableRangeStartOffset,

    document.offsetAt(selection.end) - allowableRangeStartOffset,
    delimiter
  );
  if (pairIndices == null) {
    return null;
  }

  return extractSelectionFromDelimiterIndices(
    document,
    allowableRangeStartOffset,
    pairIndices,
    delimiterInclusion
  ).map(({ selection, context }) => ({
    selection: { selection, editor },
    context,
  }));
}

function extractSelectionFromDelimiterIndices(
  document: TextDocument,
  allowableRangeStartOffset: number,
  delimiterIndices: PairIndices,
  delimiterInclusion: DelimiterInclusion
): SelectionWithContext[] {
  switch (delimiterInclusion) {
    case "includeDelimiters":
      return [
        {
          selection: new Selection(
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.leftDelimiter.start
            ),
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.rightDelimiter.end
            )
          ),
          context: {},
        },
      ];
    case "excludeDelimiters":
      return [
        {
          selection: new Selection(
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.leftDelimiter.end
            ),
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.rightDelimiter.start
            )
          ),
          context: {},
        },
      ];
    case "delimitersOnly":
      return [
        {
          selection: new Selection(
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.leftDelimiter.start
            ),
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.leftDelimiter.end
            )
          ),
          context: {},
        },
        {
          selection: new Selection(
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.rightDelimiter.start
            ),
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.rightDelimiter.end
            )
          ),
          context: {},
        },
      ];
  }
}

interface DelimiterIndices {
  start: number;
  end: number;
}

interface PairIndices {
  leftDelimiter: DelimiterIndices;
  rightDelimiter: DelimiterIndices;
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
interface DelimiterMatch {
  text: string;
  index: number;
}
function findSurroundingPairInText(
  text: string,
  selectionStartIndex: number,
  selectionEndIndex: number,
  delimiter: Delimiter | null
): PairIndices | null {
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

  const delimiterMatches: DelimiterMatch[] = matchAll(
    text,
    delimiterRegex,
    (match) => ({
      text: match[0],
      index: match.index!,
    })
  );

  if (selectionStartIndex === selectionEndIndex) {
    const selectionIndex = selectionStartIndex;

    const selectionIndexMatchIndex = sortedIndexBy<{ index: number }>(
      delimiterMatches,
      { index: selectionIndex },
      "index"
    );
    const nextDelimiter = delimiterMatches[selectionIndexMatchIndex];
    const previousDelimiter = delimiterMatches[selectionIndexMatchIndex - 1];
    if (nextDelimiter != null && nextDelimiter.index === selectionIndex) {
      const delimiterInfo = delimiterTaxToDelimiterInfoMap[nextDelimiter.text];
      const possibleMatch = findOppositeDelimiter(
        delimiterMatches,
        selectionIndexMatchIndex,
        delimiterInfo
      );
      if (possibleMatch != null) {
        return getDelimiterPair(nextDelimiter, possibleMatch);
      }
    }

    if (
      previousDelimiter != null &&
      selectionIndex <= previousDelimiter.index + previousDelimiter.text.length
    ) {
      const delimiterInfo =
        delimiterTaxToDelimiterInfoMap[previousDelimiter.text];
      const possibleMatch = findOppositeDelimiter(
        delimiterMatches,
        selectionIndexMatchIndex - 1,
        delimiterInfo
      );
      if (possibleMatch != null) {
        return getDelimiterPair(previousDelimiter, possibleMatch);
      }
    }
  }

  // TODO: Handle the case where we have a non empty selection. In this case
  // we look for the smallest delimiter pair that weakly contains our
  // selection
  return null;
}

function getDelimiterPair(
  delimiter1: DelimiterMatch,
  delimiter2: DelimiterMatch
) {
  const isDelimiter1First = delimiter1.index < delimiter2.index;
  const leftDelimiter = isDelimiter1First ? delimiter1 : delimiter2;
  const rightDelimiter = isDelimiter1First ? delimiter2 : delimiter1;

  return {
    leftDelimiter: {
      start: leftDelimiter.index,
      end: leftDelimiter.index + leftDelimiter.text.length,
    },
    rightDelimiter: {
      start: rightDelimiter.index,
      end: rightDelimiter.index + rightDelimiter.text.length,
    },
  };
}

function findOppositeDelimiter(
  delimiterMatches: DelimiterMatch[],
  index: number,
  delimiterInfo: IndividualDelimiter
) {
  const { direction, oppositeText, text: delimiterText } = delimiterInfo;

  switch (direction) {
    case "left":
      return findOppositeDelimiterOneWay(
        delimiterMatches,
        index,
        delimiterText,
        oppositeText,
        false
      );
    case "right":
      return findOppositeDelimiterOneWay(
        delimiterMatches,
        index,
        delimiterText,
        oppositeText,
        true
      );
    case "bidirectional":
      return (
        findOppositeDelimiterOneWay(
          delimiterMatches,
          index,
          delimiterText,
          oppositeText,
          true
        ) ??
        findOppositeDelimiterOneWay(
          delimiterMatches,
          index,
          delimiterText,
          oppositeText,
          false
        )
      );
  }
}

function findOppositeDelimiterOneWay(
  delimiterMatches: DelimiterMatch[],
  index: number,
  delimiterText: string,
  oppositeText: string,
  lookForward: boolean
) {
  const indices = lookForward
    ? range(index + 1, delimiterMatches.length, 1)
    : range(index - 1, -1, -1);

  let delimiterBalance = 1;
  for (const index of indices) {
    const match = delimiterMatches[index];
    // NB: We check for opposite text first because in the case of a match
    // where left and right or equal we want to make sure we end rather than
    // treating it as nested
    if (match.text === oppositeText) {
      delimiterBalance--;
      if (delimiterBalance === 0) {
        return match;
      }
    } else if (match.text === delimiterText) {
      delimiterBalance++;
    }
  }

  return null;
}
