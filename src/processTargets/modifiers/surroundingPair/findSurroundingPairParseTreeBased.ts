import { Selection, TextDocument, TextEditor } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import {
  SurroundingPairName,
  DelimiterInclusion,
} from "../../../typings/Types";
import { getNodeRange } from "../../../util/nodeSelectors";
import { extractSelectionFromSurroundingPairOffsets } from "./extractSelectionFromSurroundingPairOffsets";
import { findSurroundingPairCore } from "./findSurroundingPairCore";
import {
  DelimiterLookupMap,
  getDelimiterLookupMap,
} from "./getIndividualDelimiters";
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

  const delimiterLookupMap = getDelimiterLookupMap(delimiters);

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
      delimiterLookupMap,
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
  delimiterLookupMap: DelimiterLookupMap,
  delimiters: SurroundingPairName[],
  selectionOffsets: Offsets
) {
  const possibleDelimiterNodes = node.descendantsOfType([
    ...delimiterLookupMap.keys(),
  ]);

  const delimiterOccurrences: PossibleDelimiterOccurrence[] =
    possibleDelimiterNodes.map((delimiterNode) => {
      return {
        offsets: {
          start: delimiterNode.startIndex,
          end: delimiterNode.endIndex,
        },

        get possibleDelimiterInfos() {
          let possibleDelimiterInfos =
            delimiterLookupMap.get(delimiterNode.type) ?? [];

          if (possibleDelimiterInfos.length > 1) {
            // If the text of the delimiter doesn't tell us whether it is left
            // or right (eg for a `"`), then we see whether it is the first or
            // last child of its parent to decide whether it's left or right.
            const knownSide = delimiterNode.parent?.firstChild?.equals(
              delimiterNode
            )
              ? "left"
              : delimiterNode.parent?.lastChild?.equals(delimiterNode)
              ? "right"
              : null;

            if (knownSide != null) {
              possibleDelimiterInfos = possibleDelimiterInfos.filter(
                ({ side }) => side === knownSide
              );
            }
          }

          return possibleDelimiterInfos;
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
