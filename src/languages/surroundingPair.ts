import { maxBy, zip } from "lodash";
import { Position, Selection } from "vscode";
import { Point, SyntaxNode } from "web-tree-sitter";
import {
  Delimiter,
  DelimiterInclusion,
  NodeMatcher,
  NodeMatcherValue,
  SelectionWithEditor,
} from "../Types";

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
};

const leftToRightMap: Record<string, string> = Object.fromEntries(
  Object.values(delimiterToText)
);

export function createSurroundingPairMatcher(
  delimiter: Delimiter | null,
  delimiterInclusion: DelimiterInclusion
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
      delimiterInclusion
    );
  };
}

function extractSelection(
  leftDelimiterNode: SyntaxNode,
  rightDelimiterNode: SyntaxNode,
  delimiterInclusion: DelimiterInclusion
): NodeMatcherValue[] {
  var selections: Selection[];

  switch (delimiterInclusion) {
    case "includeDelimiters":
      selections = [
        new Selection(
          positionFromPoint(leftDelimiterNode.startPosition),
          positionFromPoint(rightDelimiterNode.endPosition)
        ),
      ];
      break;
    case "excludeDelimiters":
      selections = [
        new Selection(
          positionFromPoint(leftDelimiterNode.endPosition),
          positionFromPoint(rightDelimiterNode.startPosition)
        ),
      ];
      break;
    case "delimitersOnly":
      selections = [
        new Selection(
          positionFromPoint(leftDelimiterNode.startPosition),
          positionFromPoint(leftDelimiterNode.endPosition)
        ),
        new Selection(
          positionFromPoint(rightDelimiterNode.startPosition),
          positionFromPoint(rightDelimiterNode.endPosition)
        ),
      ];
      break;
  }

  return selections.map((selection) => ({
    node: leftDelimiterNode,
    selection: {
      selection,
      context: {},
    },
  }));
}
