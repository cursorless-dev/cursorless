import {
  ComplexSurroundingPairName,
  Selection,
  SurroundingPairScopeType,
} from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import { LanguageDefinitions } from "../../../languages/LanguageDefinitions";
import getTextFragmentExtractor from "../../../languages/getTextFragmentExtractor";
import { Target } from "../../../typings/target.types";
import { SurroundingPairTarget } from "../../targets";
import { getContainingScopeTarget } from "../getContainingScopeTarget";
import { complexDelimiterMap } from "./getDelimiterMaps";
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
 * @param editor The editor containing the range
 * @param range The range to process
 * @param scopeType The surrounding pair modifier information
 * @returns The new selection expanded to the containing surrounding pair or
 * `null` if none was found
 */
export function processSurroundingPair(
  languageDefinitions: LanguageDefinitions,
  target: Target,
  scopeType: SurroundingPairScopeType,
): SurroundingPairTarget | null {
  const pairInfo = processSurroundingPairCore(
    languageDefinitions,
    target,
    scopeType,
  );

  if (pairInfo == null) {
    return null;
  }

  return new SurroundingPairTarget({
    ...pairInfo,
    editor: target.editor,
    isReversed: target.isReversed,
  });
}

/**
 * Helper function that does the real work; caller just calls this function and
 * converts output from a {@link SurroundingPairInfo} to a
 * {@link SurroundingPairTarget}.
 */
function processSurroundingPairCore(
  languageDefinitions: LanguageDefinitions,
  target: Target,
  scopeType: SurroundingPairScopeType,
): SurroundingPairInfo | null {
  const { editor, contentRange: range } = target;
  const languageDefinition = languageDefinitions.get(
    target.editor.document.languageId,
  );

  const document = editor.document;
  const delimiters = complexDelimiterMap[
    scopeType.delimiter as ComplexSurroundingPairName
  ] ?? [scopeType.delimiter];

  let node: SyntaxNode | null;

  try {
    node = languageDefinitions.getNodeAtLocation(document, range);

    // Error nodes are unreliable and should be ignored. Fall back to text based
    // algorithm.
    if (nodeHasError(node)) {
      return findSurroundingPairTextBased(
        editor,
        range,
        null,
        delimiters,
        scopeType,
      );
    }
  } catch (err) {
    if ((err as Error).name === "UnsupportedLanguageError") {
      // If we're in a language where we don't have a parse tree we use the text
      // based algorithm
      return findSurroundingPairTextBased(
        editor,
        range,
        null,
        delimiters,
        scopeType,
      );
    } else {
      throw err;
    }
  }

  const textFragmentRange = (() => {
    // First try to use the text fragment scope handler if it exists
    const textFragmentScopeHandler =
      languageDefinition?.getTextFragmentScopeHandler();

    if (textFragmentScopeHandler != null) {
      const containingScope = getContainingScopeTarget(
        target,
        textFragmentScopeHandler,
        0,
      );

      return containingScope?.[0].contentRange;
    }

    // Then try to use the legacy text fragment extractor if it exists
    const textFragmentExtractor = getTextFragmentExtractor(document.languageId);

    if (textFragmentExtractor == null) {
      // If the text fragment extractor doesn't exist, or if it explicitly is
      // set to `null`, then we just use text-based algorithm on entire document
      return document.range;
    }

    const selectionWithEditor = {
      editor,
      selection: new Selection(range.start, range.end),
    };

    return textFragmentExtractor(node, selectionWithEditor);
  })();

  if (textFragmentRange != null) {
    // If we have a parse tree but we are in a string node or in a comment node,
    // then we use the text-based algorithm
    const surroundingRange = findSurroundingPairTextBased(
      editor,
      range,
      textFragmentRange,
      delimiters,
      scopeType,
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
    scopeType,
  );
}

function nodeHasError(node: SyntaxNode, includeChildren = false): boolean {
  if (nodeIsError(node)) {
    return true;
  }
  if (includeChildren) {
    if (node.children.some(nodeIsError)) {
      return true;
    }
  }
  if (node.parent != null) {
    return nodeHasError(node.parent, true);
  }
  return false;
}

function nodeIsError(node: SyntaxNode): boolean {
  return node.type === "ERROR";
}
