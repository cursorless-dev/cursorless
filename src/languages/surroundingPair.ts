import { LargeNumberLike } from "crypto";
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
  escapedParentheses: ["\\(", "\\)"],
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
  opposite: IndividualDelimiter;
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

interface DelimiterMatch {
  text: string;
  startIndex: number;
  endIndex: number;
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
function findSurroundingPairInText(
  text: string,
  selectionStartIndex: number,
  selectionEndIndex: number,
  delimiter: Delimiter | null
): PairIndices | null {
  const delimitersToCheck = delimiter == null ? anyDelimiter : [delimiter];

  const individualDelimiters = getIndividualDelimiters(delimitersToCheck);

  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
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
    (match) => {
      const startIndex = match.index!;
      const text = match[0];
      return {
        text,
        startIndex,
        endIndex: startIndex + text.length,
      };
    }
  );

  const initialIndex = sortedIndexBy<{ endIndex: number }>(
    delimiterMatches,
    { endIndex: selectionEndIndex },
    "endIndex"
  );

  const delimiterPairAdjacentToSelection: PairIndices | null =
    findDelimiterPairAdjacentToSelection(
      initialIndex,
      delimiterMatches,
      selectionStartIndex,
      selectionEndIndex,
      delimiterTextToDelimiterInfoMap
    );

  if (delimiterPairAdjacentToSelection != null) {
    return delimiterPairAdjacentToSelection;
  }

  return findDelimiterPairWeaklyContainingSelection(
    initialIndex,
    delimiterMatches,
    individualDelimiters,
    selectionStartIndex
  );
}

function findDelimiterPairAdjacentToSelection(
  initialIndex: number,
  delimiterMatches: DelimiterMatch[],
  selectionStartIndex: number,
  selectionEndIndex: number,
  delimiterTextToDelimiterInfoMap: { [k: string]: IndividualDelimiter }
): PairIndices | null {
  const indicesToTry = [initialIndex + 1, initialIndex];

  for (const index of indicesToTry) {
    const match = delimiterMatches[index];

    if (
      match != null &&
      match.startIndex <= selectionStartIndex &&
      match.endIndex >= selectionEndIndex
    ) {
      const delimiterInfo = delimiterTextToDelimiterInfoMap[match.text];

      if (delimiterInfo != null) {
        const possibleMatch = findOppositeDelimiter(
          delimiterMatches,
          index,
          delimiterInfo
        );

        if (possibleMatch != null) {
          return getDelimiterPair(match, possibleMatch);
        }
      }
    }
  }

  return null;
}

function findDelimiterPairWeaklyContainingSelection(
  initialIndex: number,
  delimiterMatches: DelimiterMatch[],
  individualDelimiters: IndividualDelimiter[],
  selectionStartIndex: number
): PairIndices | null {
  const rightDelimiters = individualDelimiters.filter(
    ({ direction }) => direction === "bidirectional" || direction === "left"
  );
  let leftDelimiters: IndividualDelimiter[] = [];

  const rightDelimiterGenerator = generateUnmatchedDelimiters(
    delimiterMatches,
    initialIndex,
    () => rightDelimiters,
    true
  );

  const leftDelimiterGenerator = generateUnmatchedDelimiters(
    delimiterMatches,
    initialIndex - 1,
    () => leftDelimiters,
    false
  );

  while (true) {
    let rightNext = rightDelimiterGenerator.next();
    if (rightNext.done) {
      return null;
    }
    let rightMatch = rightNext.value!;

    leftDelimiters = [rightMatch.delimiterInfo.opposite];
    let leftNext = leftDelimiterGenerator.next();
    if (leftNext.done) {
      return null;
    }
    let leftMatch = leftNext.value!.match;

    if (leftMatch.startIndex <= selectionStartIndex) {
      return getDelimiterPair(leftMatch, rightMatch.match);
    }
  }
}

function getIndividualDelimiters(
  delimitersToCheck: Delimiter[]
): IndividualDelimiter[] {
  return delimitersToCheck
    .map((delimiter) => {
      const [leftDelimiter, rightDelimiter] = delimiterToText[delimiter];

      if (leftDelimiter === rightDelimiter) {
        const delimiterResult: Partial<IndividualDelimiter> = {
          text: leftDelimiter,
          direction: "bidirectional",
          delimiter,
        };
        delimiterResult.opposite = delimiterResult as IndividualDelimiter;
        return [delimiterResult as IndividualDelimiter];
      } else {
        const leftDelimiterResult: Partial<IndividualDelimiter> = {
          text: leftDelimiter,
          direction: "right",
          delimiter,
        };
        const rightDelimiterResult: Partial<IndividualDelimiter> = {
          text: rightDelimiter,
          direction: "left",
          delimiter,
        };
        rightDelimiterResult.opposite =
          leftDelimiterResult as IndividualDelimiter;
        leftDelimiterResult.opposite =
          rightDelimiterResult as IndividualDelimiter;
        return [
          leftDelimiterResult as IndividualDelimiter,
          rightDelimiterResult as IndividualDelimiter,
        ];
      }
    })
    .flat();
}

function getDelimiterPair(
  delimiter1: DelimiterMatch,
  delimiter2: DelimiterMatch
): PairIndices {
  const isDelimiter1First = delimiter1.startIndex < delimiter2.startIndex;
  const leftDelimiter = isDelimiter1First ? delimiter1 : delimiter2;
  const rightDelimiter = isDelimiter1First ? delimiter2 : delimiter1;

  return {
    leftDelimiter: {
      start: leftDelimiter.startIndex,
      end: leftDelimiter.endIndex,
    },
    rightDelimiter: {
      start: rightDelimiter.startIndex,
      end: rightDelimiter.endIndex,
    },
  };
}

function findOppositeDelimiter(
  delimiterMatches: DelimiterMatch[],
  index: number,
  delimiterInfo: IndividualDelimiter
): DelimiterMatch | null {
  const { direction, opposite } = delimiterInfo;

  switch (direction) {
    case "left":
      return findUnmatchedDelimiter(
        delimiterMatches,
        index - 1,
        [opposite],
        false
      );
    case "right":
      return findUnmatchedDelimiter(
        delimiterMatches,
        index + 1,
        [opposite],
        true
      );
    case "bidirectional":
      return (
        findUnmatchedDelimiter(delimiterMatches, index + 1, [opposite], true) ??
        findUnmatchedDelimiter(delimiterMatches, index - 1, [opposite], false)
      );
  }
}
// (  [  )  ]
// [  (    )
// {   (  ] } )
function findUnmatchedDelimiter(
  delimiterMatches: DelimiterMatch[],
  initialIndex: number,
  delimitersToCheck: IndividualDelimiter[],
  lookForward: boolean
): DelimiterMatch | null {
  const generatorResult = generateUnmatchedDelimiters(
    delimiterMatches,
    initialIndex,
    () => delimitersToCheck,
    lookForward
  ).next();

  return generatorResult.done ? null : generatorResult.value.match;
}

interface GeneratorResult {
  match: DelimiterMatch;
  delimiterInfo: IndividualDelimiter;
}

function* generateUnmatchedDelimiters(
  delimiterMatches: DelimiterMatch[],
  initialIndex: number,
  delimitersToCheck: () => IndividualDelimiter[],
  lookForward: boolean
): Generator<GeneratorResult, void, never> {
  const indices = lookForward
    ? range(initialIndex, delimiterMatches.length, 1)
    : range(initialIndex, -1, -1);

  let delimiterBalances: Partial<Record<Delimiter, number>> = {};
  for (const index of indices) {
    const match = delimiterMatches[index];

    const matchingDelimiter = delimitersToCheck().find(
      ({ text }) => text === match.text
    );

    // NB: We check for opposite text first because in the case of a match
    // where left and right or equal we want to make sure we end rather than
    // treating it as nested
    if (matchingDelimiter != null) {
      const matchingDelimiterName = matchingDelimiter.delimiter;

      const newDelimiterBalance =
        (delimiterBalances[matchingDelimiterName] ?? 1) - 1;

      if (newDelimiterBalance === 0) {
        yield { match, delimiterInfo: matchingDelimiter };
        delimiterBalances[matchingDelimiterName] = 1;
      } else {
        delimiterBalances[matchingDelimiterName] = newDelimiterBalance;
      }
    } else {
      const oppositeDelimiter = delimitersToCheck().find(
        ({ opposite: { text } }) => text === match.text
      );

      if (oppositeDelimiter != null) {
        const matchingDelimiterName = oppositeDelimiter.delimiter;

        delimiterBalances[matchingDelimiterName] =
          (delimiterBalances[matchingDelimiterName] ?? 1) + 1;
      }
    }
  }
}
