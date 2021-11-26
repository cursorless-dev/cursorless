import { Location, Range } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { getNodeMatcher } from "../../../languages";
import { findSurroundingPairParseTreeBased } from "./findSurroundingPairParseTreeBased";
import { findSurroundingPairTextBased } from "./findSurroundingPairTextBased";
import {
  ComplexSurroundingPairName,
  NodeMatcher,
  ProcessedTargetsContext,
  SelectionWithEditor,
  SurroundingPairModifier,
} from "../../../typings/Types";
import {
  getNodeRange,
  makeRangeFromPositions,
} from "../../../util/nodeSelectors";
import { SelectionWithEditorWithContext } from "../processModifier";
import { complexDelimiterMap } from "./delimiterMaps";

/**
 * Applies the surrounding pair modifier to the given selection. First looks to
 * see if the target is itself adjacent to or contained by a modifier token. If
 * so it will expand the selection to the opposite delimiter token. Otherwise,
 * or if the opposite token wasn't found, it will proceed by finding the
 * smallest pair of delimiters which contains the selection.
 *
 * @param context Context to be leveraged by modifier
 * @param selection The selection to process
 * @param modifier The surrounding pair modifier information
 * @returns The new selection expanded to the containing surrounding pair or
 * `null` if none was found
 */
export function processSurroundingPair(
  context: ProcessedTargetsContext,
  selection: SelectionWithEditor,
  modifier: SurroundingPairModifier
): SelectionWithEditorWithContext[] | null {
  const document = selection.editor.document;
  const delimiters = complexDelimiterMap[
    modifier.delimiter as ComplexSurroundingPairName
  ] ?? [modifier.delimiter];

  let node: SyntaxNode | null;
  let stringNodeMatcher: NodeMatcher;
  let commentNodeMatcher: NodeMatcher;
  try {
    node = context.getNodeAtLocation(
      new Location(document.uri, selection.selection)
    );
    stringNodeMatcher = getNodeMatcher(document.languageId, "string", false);
    commentNodeMatcher = getNodeMatcher(document.languageId, "comment", false);
  } catch (err) {
    if ((err as Error).name === "UnsupportedLanguageError") {
      // If we're in a language where we don't have a parse tree we use the text
      // based algorithm
      return findSurroundingPairTextBased(
        selection.editor,
        selection.selection,
        null,
        delimiters,
        modifier.delimiterInclusion,
        modifier.forceDirection
      );
    } else {
      throw err;
    }
  }

  // If we have a parse tree but we are in a string node or in a comment node,
  // then we use the text-based algorithm
  const isStringNode = stringNodeMatcher(selection, node) != null;
  if (isStringNode || commentNodeMatcher(selection, node) != null) {
    let nodeRange: Range;

    if (isStringNode) {
      const children = node.children;

      if (children.length !== 0) {
        nodeRange = makeRangeFromPositions(
          children[0].endPosition,
          children[children.length - 1].startPosition
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
      delimiters,
      modifier.delimiterInclusion,
      modifier.forceDirection
    );

    if (surroundingRange != null) {
      return surroundingRange;
    }
  }

  // If we have a parse tree and either we are not in a string or comment or we
  // couldn't find a surrounding pair within a string or comment, we use the
  // parse tree-based algorithm
  return findSurroundingPairParseTreeBased(
    selection.editor,
    selection.selection,
    node,
    delimiters,
    modifier.delimiterInclusion,
    modifier.forceDirection
  );
}
