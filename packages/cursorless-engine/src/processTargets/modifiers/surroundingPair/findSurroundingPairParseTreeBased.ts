import { Range, TextDocument, TextEditor } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import {
  SimpleSurroundingPairName,
  SurroundingPairScopeType,
} from "@cursorless/common";
import { getNodeRange } from "../../../util/nodeSelectors";
import { isContainedInErrorNode } from "../../../util/treeSitterUtils";
import { extractSelectionFromSurroundingPairOffsets } from "./extractSelectionFromSurroundingPairOffsets";
import { findSurroundingPairCore } from "./findSurroundingPairCore";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import {
  IndividualDelimiter,
  Offsets,
  PossibleDelimiterOccurrence,
} from "./types";

/**
 * Implements the version of the surrounding pair finding algorithm that
 * leverages the parse tree.  We use this algorithm when we are in a language
 * for which we have parser support, unless we are in a string or comment, where
 * we revert to text-based.
 *
 * The approach is actually roughly the same as the approach we use when we do
 * not have access to a parse tree.  In both cases we create a list of
 * candidate delimiters in the region of the selection, and then pass them to
 * the core algorithm, implemented by findSurroundingPairCore.
 *
 * To generate a list of delimiters to pass to findSurroundingPairCore, we repeatedly walk up the parse tree starting at the given node.  Each time, we ask for all descendant tokens whose type is that of one of the delimiters that we're looking for.
 * repeatedly walk up the parse tree starting at the given node.  Each time, we
 * ask for all descendant tokens whose type is that of one of the delimiters
 * that we're looking for, and pass this list of tokens to
 * findSurroundingPairCore.
 *
 * Note that walking up the hierarchy one parent at a time is just an
 * optimization to avoid handling the entire file if we don't need to.  The
 * result would be the same if we just operated on the root node of the parse
 * tree, just slower if our delimiter pair is actually contained in a small
 * piece of a large file.
 *
 * The main benefits of the parse tree-based approach over the text-based
 * approach are the following:
 *
 * - We can leverage the lexer to ensure that we only consider proper language tokens
 * - We can let the language normalize surface forms of delimiter types, so eg
 * in Python the leading `f"` on an f-string just has type `"` like any other
 * string.
 * - We can more easily narrow the scope of our search by walking up the parse tree
 * - The actual lexing is done in fast wasm code rather than using a regex
 * - We can disambiguate delimiters whose opening and closing symbol is the
 * same (eg `"`).  Without a parse tree we have to guess whether it is an
 * opening or closing quote.
 *
 * @param editor The text editor containing the selection
 * @param selection The selection to find surrounding pair around
 * @param node A parse tree node overlapping with the selection
 * @param delimiters The acceptable surrounding pair names
 * @returns The newly expanded selection, including editor info
 */
export function findSurroundingPairParseTreeBased(
  editor: TextEditor,
  selection: Range,
  node: SyntaxNode,
  delimiters: SimpleSurroundingPairName[],
  scopeType: SurroundingPairScopeType,
) {
  const document: TextDocument = editor.document;

  const individualDelimiters = getIndividualDelimiters(
    document.languageId,
    delimiters,
  );

  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ]),
  );

  const selectionOffsets = {
    start: document.offsetAt(selection.start),
    end: document.offsetAt(selection.end),
  };

  /**
   * Context to pass to nested call
   */
  const context: Context = {
    delimiterTextToDelimiterInfoMap,
    individualDelimiters,
    delimiters,
    selectionOffsets,
    scopeType,
  };

  // Walk up the parse tree from parent to parent until we find a node whose
  // descendants contain an appropriate matching pair.
  for (
    let currentNode: SyntaxNode | null = node;
    currentNode != null;
    currentNode = currentNode.parent
  ) {
    // Just bail early if the node doesn't completely contain our selection as
    // it is a lost cause.
    if (!getNodeRange(currentNode).contains(selection)) {
      continue;
    }

    // Here we apply the core algorithm
    const pairOffsets = findSurroundingPairContainedInNode(
      context,
      currentNode,
    );

    // And then perform postprocessing
    if (pairOffsets != null) {
      return extractSelectionFromSurroundingPairOffsets(
        document,
        0,
        pairOffsets,
      );
    }
  }

  return null;
}

/**
 * Context to pass to nested call
 */
interface Context {
  /**
   * Map from raw text to info about the delimiter at that point
   */
  delimiterTextToDelimiterInfoMap: {
    [k: string]: IndividualDelimiter;
  };

  /**
   * A list of all opening / closing delimiters that we are considering
   */
  individualDelimiters: IndividualDelimiter[];

  /**
   * The names of the delimiters that we're considering
   */
  delimiters: SimpleSurroundingPairName[];

  /**
   * The offsets of the selection
   */
  selectionOffsets: Offsets;

  scopeType: SurroundingPairScopeType;
}

/**
 * This function is called at each node as we walk up the ancestor hierarchy
 * from our start node.  It finds all possible delimiters descending from the
 * node and passes them to the findSurroundingPairCore algorithm.
 *
 * @param context Extra context to be used by this function
 * @param node The current node to consider
 * @returns The offsets of the matching surrounding pair, or `null` if none is found
 */
function findSurroundingPairContainedInNode(
  context: Context,
  node: SyntaxNode,
) {
  const {
    delimiterTextToDelimiterInfoMap,
    individualDelimiters,
    delimiters,
    selectionOffsets,
    scopeType,
  } = context;

  /**
   * A list of all delimiter nodes descending from `node`, as determined by
   * their type.
   * Handles the case of error nodes with no text. https://github.com/cursorless-dev/cursorless/issues/688
   */
  const possibleDelimiterNodes = node
    .descendantsOfType(individualDelimiters.map(({ text }) => text))
    .filter((node) => !(node.text === "" && node.hasError()));

  /**
   * A list of all delimiter occurrences, generated from the delimiter nodes.
   */
  const delimiterOccurrences: PossibleDelimiterOccurrence[] =
    possibleDelimiterNodes.map((delimiterNode) => {
      return {
        offsets: {
          start: delimiterNode.startIndex,
          end: delimiterNode.endIndex,
        },
        get delimiterInfo() {
          const delimiterInfo =
            delimiterTextToDelimiterInfoMap[delimiterNode.type];

          // Distinguish between a greater-than sign and an angle bracket by
          // looking at its position within its parent node.
          if (
            delimiterInfo.delimiter === "angleBrackets" &&
            inferDelimiterSide(delimiterNode) !== delimiterInfo.side &&
            !isContainedInErrorNode(delimiterNode)
          ) {
            return undefined;
          }

          // NB: If side is `"unknown"`, ie we cannot determine whether
          // something is a left or right delimiter based on its text / type
          // alone (eg `"`), we assume it is a left delimiter if it is the
          // first child of its parent, and right delimiter otherwise.  This
          // approach might not always work, but seems to work in the
          // languages we've tried.
          const side =
            delimiterInfo.side === "unknown" && scopeType.forceDirection == null
              ? inferDelimiterSide(delimiterNode)
              : delimiterInfo.side;

          return {
            ...delimiterInfo,
            side,
          };
        },
      };
    });

  // Just run core algorithm once we have our list of delimiters.
  return findSurroundingPairCore(
    scopeType,
    delimiterOccurrences,
    delimiters,
    selectionOffsets,

    // If we're not the root node of the parse tree (ie `node.parent !=
    // null`), we tell `findSurroundingPairCore` to bail if it finds a
    // delimiter adjacent to our selection, but doesn't find its opposite
    // delimiter within our list. We do so because it's possible that the
    // adjacent delimiter's opposite might be found when we run again on a
    // parent node later.
    node.parent != null,
  );
}

function inferDelimiterSide(delimiterNode: SyntaxNode) {
  return delimiterNode.parent?.firstChild?.equals(delimiterNode)
    ? "left"
    : delimiterNode.parent?.lastChild?.equals(delimiterNode)
    ? "right"
    : ("unknown" as const);
}
