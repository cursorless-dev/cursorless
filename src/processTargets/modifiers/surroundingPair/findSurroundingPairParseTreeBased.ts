import { Selection, TextDocument, TextEditor } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { Delimiter, DelimiterInclusion } from "../../../typings/Types";
import { getNodeRange } from "../../../util/nodeSelectors";
import { extractSelectionFromDelimiterIndices } from "./extractSelectionFromDelimiterIndices";
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
  delimiter: Delimiter | null,
  delimiterInclusion: DelimiterInclusion
) {
  const document: TextDocument = editor.document;

  const individualDelimiters = getIndividualDelimiters(delimiter);

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

    const pairIndices = findPairIndicesInNode(
      currentNode,
      delimiterTextToDelimiterInfoMap,
      individualDelimiters,
      selectionOffsets
    );

    if (pairIndices != null) {
      return extractSelectionFromDelimiterIndices(
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

function findPairIndicesInNode(
  node: SyntaxNode,
  delimiterTextToDelimiterInfoMap: {
    [k: string]: IndividualDelimiter;
  },
  individualDelimiters: IndividualDelimiter[],
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
                : delimiterNode.parent?.lastChild === delimiterNode
                ? "right"
                : "left",
          };
        },
      };
    });

  return findSurroundingPairCore(
    delimiterOccurrences,
    individualDelimiters,
    selectionOffsets
  );
}
