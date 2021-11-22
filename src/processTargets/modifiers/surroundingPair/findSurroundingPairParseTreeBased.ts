import { Selection, TextDocument, TextEditor } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import {
  SurroundingPairName,
  DelimiterInclusion,
} from "../../../typings/Types";
import { getNodeRange } from "../../../util/nodeSelectors";
import { extractSelectionFromSurroundingPairOffsets } from "./extractSelectionFromSurroundingPairOffsets";
import { findSurroundingPairCore } from "./findSurroundingPairCore";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import {
  IndividualDelimiter,
  Offsets,
  PossibleDelimiterOccurrence,
} from "./types";

export function findSurroundingPairParseTreeBased(
  editor: TextEditor,
  selection: Selection,
  node: SyntaxNode,
  delimiters: SurroundingPairName[],
  delimiterInclusion: DelimiterInclusion
) {
  const document: TextDocument = editor.document;

  const individualDelimiters = getIndividualDelimiters(delimiters);

  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ])
  );

  const selectionOffsets = {
    start: document.offsetAt(selection.start),
    end: document.offsetAt(selection.end),
  };

  for (
    let currentNode: SyntaxNode | null = node;
    currentNode != null;
    currentNode = currentNode.parent
  ) {
    if (!getNodeRange(currentNode).contains(selection)) {
      continue;
    }

    const pairIndices = findSurroundingPairContainedInNode(
      currentNode,
      delimiterTextToDelimiterInfoMap,
      individualDelimiters,
      delimiters,
      selectionOffsets
    );

    if (pairIndices != null) {
      return extractSelectionFromSurroundingPairOffsets(
        document,
        0,
        pairIndices,
        delimiterInclusion
      ).map(({ selection, context }) => ({
        selection: { selection, editor },
        context,
      }));
    }
  }

  return null;
}

function findSurroundingPairContainedInNode(
  node: SyntaxNode,
  delimiterTextToDelimiterInfoMap: {
    [k: string]: IndividualDelimiter;
  },
  individualDelimiters: IndividualDelimiter[],
  delimiters: SurroundingPairName[],
  selectionOffsets: Offsets
) {
  const possibleDelimiterNodes = node.descendantsOfType(
    individualDelimiters.map(({ text }) => text)
  );

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
          return {
            ...delimiterInfo,
            side:
              delimiterInfo.side !== "unknown"
                ? delimiterInfo.side
                : delimiterNode.parent?.firstChild?.equals(delimiterNode)
                ? "left"
                : delimiterNode.parent?.lastChild?.equals(delimiterNode)
                ? "right"
                : ("unknown" as const),
          };
        },
      };
    });

  return findSurroundingPairCore(
    delimiterOccurrences,
    delimiters,
    selectionOffsets,
    node.parent != null
  );
}
