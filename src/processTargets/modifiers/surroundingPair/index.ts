import { Location, Range, Selection, TextEditor } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import getTextFragmentExtractor, {
  TextFragmentExtractor,
} from "../../../languages/getTextFragmentExtractor";
import {
  ComplexSurroundingPairName,
  SurroundingPairScopeType
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { complexDelimiterMap } from "./delimiterMaps";
import { SurroundingPairInfo } from "./extractSelectionFromSurroundingPairOffsets";
import { findSurroundingPairParseTreeBased } from "./findSurroundingPairParseTreeBased";
import { findSurroundingPairTextBased } from "./findSurroundingPairTextBased";

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
  editor: TextEditor,
  range: Range,
  modifier: SurroundingPairScopeType
): SurroundingPairInfo | null {
  const document = editor.document;
  const delimiters = complexDelimiterMap[
    modifier.delimiter as ComplexSurroundingPairName
  ] ?? [modifier.delimiter];

  let node: SyntaxNode | null;
  let textFragmentExtractor: TextFragmentExtractor;

  try {
    node = context.getNodeAtLocation(new Location(document.uri, range));

    textFragmentExtractor = getTextFragmentExtractor(document.languageId);
  } catch (err) {
    if ((err as Error).name === "UnsupportedLanguageError") {
      // If we're in a language where we don't have a parse tree we use the text
      // based algorithm
      return findSurroundingPairTextBased(
        editor,
        range,
        null,
        delimiters,
        modifier.forceDirection
      );
    } else {
      throw err;
    }
  }

  // If we have a parse tree but we are in a string node or in a comment node,
  // then we use the text-based algorithm
  const selectionWithEditor = {
    editor,
    selection: new Selection(range.start, range.end),
  };
  const textFragmentRange = textFragmentExtractor(node, selectionWithEditor);
  if (textFragmentRange != null) {
    const surroundingRange = findSurroundingPairTextBased(
      editor,
      range,
      textFragmentRange,
      delimiters,
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
    editor,
    range,
    node,
    delimiters,
    modifier.forceDirection
  );
}
