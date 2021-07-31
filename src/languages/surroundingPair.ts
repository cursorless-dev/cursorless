import { Position, TextEditor, Selection } from "vscode";
import { Point, SyntaxNode } from "web-tree-sitter";
import {
  Delimiter,
  NodeMatcher,
  NodeMatcherValue,
  SelectionWithContext,
  SelectionWithEditor,
} from "../Types";

function positionFromPoint(point: Point): Position {
  return new Position(point.row, point.column);
}

const delimiterToText: Record<Delimiter, String[]> = {
  squareBrackets: ["[", "]"],
  curlyBrackets: ["{", "}"],
  angleBrackets: ["<", ">"],
  parentheses: ["(", ")"],
  singleQuotes: ["'", "'"],
  doubleQuotes: ['"', '"'],
};
function isSyntaxNodeLeftPartOfMatching(
  node: SyntaxNode,
  delimiter: Delimiter
): boolean {
  return node.type === delimiterToText[delimiter][0];
}
function isSyntaxNodeRightPartOfMatching(
  node: SyntaxNode,
  delimiter: Delimiter
): boolean {
  return node.type === delimiterToText[delimiter][1];
}

export function createSurroundingPairMatcher(
  delimiter: Delimiter | null,
  delimitersOnly: boolean
): NodeMatcher {
  return function nodeMatcher(
    selection: SelectionWithEditor,
    node: SyntaxNode
  ) {
    let delimetersToCheck: Delimiter[];
    if (delimiter != null) {
      delimetersToCheck = [delimiter];
    } else {
      delimetersToCheck = [
        "squareBrackets",
        "curlyBrackets",
        "angleBrackets",
        "parentheses",
        "singleQuotes",
        "doubleQuotes",
      ];
    }

    // This is a hack for a strange behavior of treesitter.
    // The problem is that a node in treesitter representing a string "abc"  will only have two children,
    // For the left " and the right ".
    // (I only checked this for python and typescript, I'm not sure what happens in other languages)
    // Here is the rule for string node in python: https://github.com/tree-sitter/tree-sitter-python/blob/d6210ceab11e8d812d4ab59c07c81458ec6e5184/grammar.js#L868
    let nodeLeftOfSelection: SyntaxNode | null = null;
    let nodeRightOfSelection: SyntaxNode | null = null;
    for (const child of node.children) {
      // We iterate from the left so we take the **last** node that is good
      if (
        positionFromPoint(child.endPosition).isBeforeOrEqual(
          selection.selection.start
        )
      ) {
        nodeLeftOfSelection = child;
      }
      // We iterate from the left so we take the **first** node that is good
      if (
        nodeRightOfSelection == null &&
        selection.selection.start.isBeforeOrEqual(
          positionFromPoint(child.startPosition)
        )
      ) {
        nodeRightOfSelection = child;
      }
    }
    if (nodeLeftOfSelection != null && nodeRightOfSelection != null) {
      return doOutwardScan(
        nodeLeftOfSelection,
        nodeRightOfSelection,
        delimetersToCheck,
        delimitersOnly
      );
    }

    if (node.parent == null) {
      return null;
    }
    // We don't take the next sibling here, because if current node is a
    // closing element of the pair we want to take it.
    return doOutwardScan(
      node.previousSibling,
      node,
      delimetersToCheck,
      delimitersOnly
    );
  };
}

function doOutwardScan(
  scanLeftStartNode: SyntaxNode | null,
  scanRightStartNode: SyntaxNode | null,
  delimetersToCheck: Delimiter[],
  delimitersOnly: boolean
): NodeMatcherValue[] | null {
  console.log("delimiters only", delimitersOnly);
  for (const delimiter of delimetersToCheck) {
    let left = scanLeftStartNode;
    while (left != null) {
      if (isSyntaxNodeLeftPartOfMatching(left, delimiter)) {
        break;
      }
      left = left.previousSibling;
    }
    let right = scanRightStartNode;
    while (right != null) {
      if (isSyntaxNodeRightPartOfMatching(right, delimiter)) {
        break;
      }
      right = right.nextSibling;
    }
    if (left != null && right != null) {
      // We have found the matching pair
      if (delimitersOnly === false) {
        return [
          {
            node: left,
            selection: {
              selection: new Selection(
                positionFromPoint(left.endPosition),
                positionFromPoint(right.startPosition)
              ),
              context: {
                outerSelection: new Selection(
                  positionFromPoint(left.startPosition),
                  positionFromPoint(right.endPosition)
                ),
              },
            },
          },
        ];
      } else {
        return [
          {
            node: left,
            selection: {
              selection: new Selection(
                positionFromPoint(left.startPosition),
                positionFromPoint(left.endPosition)
              ),
              context: {},
            },
          },
          {
            node: right,
            selection: {
              selection: new Selection(
                positionFromPoint(right.startPosition),
                positionFromPoint(right.endPosition)
              ),
              context: {},
            },
          },
        ];
      }
    }
  }
  return null;
}
