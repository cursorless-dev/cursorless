import * as vscode from "vscode";
import { Selection } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import getTextFragmentExtractor, {
  TextFragmentExtractor,
} from "../../languages/getTextFragmentExtractor";
import {
  ComplexSurroundingPairName,
  SurroundingPairModifier,
} from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import { complexDelimiterMap } from "./surroundingPair/delimiterMaps";
import { findSurroundingPairParseTreeBased } from "./surroundingPair/findSurroundingPairParseTreeBased";
import { findSurroundingPairTextBased } from "./surroundingPair/findSurroundingPairTextBased";

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
export default class implements ModifierStage {
  run(
    context: ProcessedTargetsContext,
    modifier: SurroundingPairModifier,
    selection: TypedSelection
  ): TypedSelection | TypedSelection[] {
    const pairs = processSurroundingPair(context, modifier, selection);
    if (pairs == null) {
      throw new Error("Couldn't find containing pair");
    }
    return pairs.map((pair) => ({
      ...selection,
      editor: pair.selection.editor,
      contentRange: pair.selection.selection,
      removalRange: pair.context.outerSelection ?? undefined,
      isRawSelection: pair.context.isRawSelection,
      isNotebookCell: pair.context.isNotebookCell,
      delimiter: pair.context.containingListDelimiter ?? undefined,
      interiorRange: pair.context.interior
        ? pair.context.interior[0].selection
        : undefined,
      boundary: pair.context.boundary?.map((bound) => bound.selection),
      leadingDelimiterRange: pair.context.leadingDelimiterRange ?? undefined,
      trailingDelimiterRange: pair.context.trailingDelimiterRange ?? undefined,
    }));
  }
}

function processSurroundingPair(
  context: ProcessedTargetsContext,
  modifier: SurroundingPairModifier,
  selection: TypedSelection
) {
  const document = selection.editor.document;
  const delimiters = complexDelimiterMap[
    modifier.delimiter as ComplexSurroundingPairName
  ] ?? [modifier.delimiter];

  let node: SyntaxNode | null;
  let textFragmentExtractor: TextFragmentExtractor;

  try {
    node = context.getNodeAtLocation(
      new vscode.Location(document.uri, selection.contentRange)
    );

    textFragmentExtractor = getTextFragmentExtractor(document.languageId);
  } catch (err) {
    if ((err as Error).name === "UnsupportedLanguageError") {
      // If we're in a language where we don't have a parse tree we use the text
      // based algorithm
      return findSurroundingPairTextBased(
        selection.editor,
        selection.contentRange,
        null,
        delimiters,
        modifier.delimiterInclusion,
        modifier.forceDirection
      );
    } else {
      throw err;
    }
  }

  const selectionWithEditor = {
    editor: selection.editor,
    selection: new Selection(
      selection.contentRange.start,
      selection.contentRange.end
    ),
  };

  // If we have a parse tree but we are in a string node or in a comment node,
  // then we use the text-based algorithm
  const textFragmentRange = textFragmentExtractor(node, selectionWithEditor);
  if (textFragmentRange != null) {
    const surroundingRange = findSurroundingPairTextBased(
      selection.editor,
      selection.contentRange,
      textFragmentRange,
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
    selection.contentRange,
    node,
    delimiters,
    modifier.delimiterInclusion,
    modifier.forceDirection
  );
}
