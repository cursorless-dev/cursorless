import { maxBy, zip } from "lodash";
import { Position, Selection } from "vscode";
import { Point, SyntaxNode } from "web-tree-sitter";
import {
  Delimiter,
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

export function createSurroundingPairMatcher(
  delimiter: Delimiter | null,
  delimitersOnly: boolean
): NodeMatcher {
  return function nodeMatcher(
    selection: SelectionWithEditor,
    node: SyntaxNode
  ) {
    const delimitersToCheck =
      delimiter == null ? Object.keys(delimiterToText) : [delimiter];

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
      delimitersOnly
    );
  };
}

function extractSelection(
  leftDelimiterNode: SyntaxNode,
  rightDelimiterNode: SyntaxNode,
  delimitersOnly: boolean
): NodeMatcherValue[] {
  if (delimitersOnly === false) {
    return [
      {
        node: leftDelimiterNode,
        selection: {
          selection: new Selection(
            positionFromPoint(leftDelimiterNode.endPosition),
            positionFromPoint(rightDelimiterNode.startPosition)
          ),
          context: {
            outerSelection: new Selection(
              positionFromPoint(leftDelimiterNode.startPosition),
              positionFromPoint(rightDelimiterNode.endPosition)
            ),
          },
        },
      },
    ];
  } else {
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
