import { Location, Range } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { getNodeMatcher } from "../../../languages";
import {
  createSurroundingPairMatcher,
} from "./surroundingPair";
import { findSurroundingPairTextBased } from "./findSurroundingPairTextBased";
import {
  ProcessedTargetsContext,
  SelectionWithEditor,
  SurroundingPairModifier,
} from "../../../typings/Types";
import {
  getNodeRange,
  makeRangeFromPositions,
} from "../../../util/nodeSelectors";
import {
  SelectionWithEditorWithContext,
  findNearestContainingAncestorNode,
} from "../processModifier";

export function processSurroundingPair(
  context: ProcessedTargetsContext,
  selection: SelectionWithEditor,
  modifier: SurroundingPairModifier
): SelectionWithEditorWithContext[] | null {
  let node: SyntaxNode | null;

  const document = selection.editor.document;

  try {
    node = context.getNodeAtLocation(
      new Location(document.uri, selection.selection)
    );
  } catch (err) {
    if ((err as Error).name === "UnsupportedLanguageError") {
      node = null;
    } else {
      throw err;
    }
  }

  if (node == null) {
    // TODO: Only get a certain amount of text centered around the selection
    return findSurroundingPairTextBased(
      selection.editor,
      selection.selection,
      null,
      modifier.delimiter,
      modifier.delimiterInclusion
    );
  }

  const stringNodeMatcher = getNodeMatcher(
    document.languageId,
    "string",
    false
  );
  const commentNodeMatcher = getNodeMatcher(
    document.languageId,
    "comment",
    false
  );

  const isStringNode = stringNodeMatcher(selection, node) != null;
  if (isStringNode || commentNodeMatcher(selection, node) != null) {
    let nodeRange: Range;

    if (isStringNode) {
      const children = node.children;

      if (children.length !== 0) {
        nodeRange = makeRangeFromPositions(
          children[0].endPosition,
          node.children[node.children.length - 1].startPosition
        );
      } else {
        // This is a hack to deal with the fact that java doesn't have
        // quotation mark tokens as children of the string. Rather than letting
        // the parse tree handle the quotation marks in java, we instead just
        // let the textual surround handle them by letting it see the quotation
        // marks. In other languages we prefer to let the parser handle the
        // quotation marks in case they are more than one character long.
        nodeRange = getNodeRange(node);
      }

    } else {
      nodeRange = getNodeRange(node);
    }

    const surroundingRange = findSurroundingPairTextBased(
      selection.editor,
      selection.selection,
      nodeRange,
      modifier.delimiter,
      modifier.delimiterInclusion
    );

    if (surroundingRange != null) {
      return surroundingRange;
    }
  }

  const nodeMatcher = createSurroundingPairMatcher(
    modifier.delimiter,
    modifier.delimiterInclusion
  );
  return findNearestContainingAncestorNode(node, nodeMatcher, selection);
}
