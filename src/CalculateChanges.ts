import {
  Selection,
  Range,
  TextEditor,
  workspace,
  TextDocument,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
} from "vscode";
import { Edit } from "./Types";

interface SelectionInfo {
  range: Range;
  isReversed: boolean;
  startOffset: number;
  endOffset: number;
}

function selectionsToSelectionInfos(
  document: TextDocument,
  selectionMatrix: Selection[][]
): SelectionInfo[][] {
  return selectionMatrix.map((selections) =>
    selections.map((selection) => ({
      range: selection,
      isReversed: selection.isReversed,
      startOffset: document.offsetAt(selection.start),
      endOffset: document.offsetAt(selection.end),
    }))
  );
}

function selectionInfosToSelections(
  document: TextDocument,
  selectionInfoMatrix: SelectionInfo[][]
): Selection[][] {
  return selectionInfoMatrix.map((selectionInfos) =>
    selectionInfos.map(
      (selectionInfo) =>
        new Selection(
          document.positionAt(
            selectionInfo.isReversed
              ? selectionInfo.endOffset
              : selectionInfo.startOffset
          ),
          document.positionAt(
            selectionInfo.isReversed
              ? selectionInfo.startOffset
              : selectionInfo.endOffset
          )
        )
    )
  );
}

function updateSelectionInfoMatrix(
  contentChanges: readonly TextDocumentContentChangeEvent[],
  selectionInfoMatrix: SelectionInfo[][]
) {
  contentChanges.forEach((change) => {
    const offsetDelta = change.text.length - change.rangeLength;

    selectionInfoMatrix.forEach((selectionInfos) => {
      selectionInfos.forEach((selectionInfo) => {
        // Change is before selection. Move entire selection.
        if (change.range.start.isBefore(selectionInfo.range.start)) {
          selectionInfo.startOffset += offsetDelta;
          selectionInfo.endOffset += offsetDelta;
        }
        // Change is selection. Move just end to match.
        else if (change.range.isEqual(selectionInfo.range)) {
          selectionInfo.endOffset += offsetDelta;
        }
      });
    });
  });
}

/**
 * Takes a list of selections and future edits, and then the client can call
 * the computeChangedOffsets function after applying the edits to get the
 * original selections adjusted for the effect of the given edits
 */
export default class SelectionUpdater {
  private document: TextDocument;
  private selectionInfoMatrix: SelectionInfo[][];
  private contentChanges: TextDocumentContentChangeEvent[];

  constructor(
    editor: TextEditor,
    originalSelections: Selection[][],
    edits: Edit[]
  ) {
    this.document = editor.document;
    this.selectionInfoMatrix = selectionsToSelectionInfos(
      this.document,
      originalSelections
    );
    this.contentChanges = edits.map((edit) => ({
      range: edit.range,
      text: edit.text,
      rangeOffset: this.document.offsetAt(edit.range.start),
      rangeLength:
        this.document.offsetAt(edit.range.end) -
        this.document.offsetAt(edit.range.start),
    }));
  }

  /**
   * Call this function after applying the document edits to get the updated
   * selection ranges.
   *
   * @returns Original selections updated to take into account the given changes
   */
  calculateUpdatedSelections() {
    updateSelectionInfoMatrix(this.contentChanges, this.selectionInfoMatrix);

    return selectionInfosToSelections(this.document, this.selectionInfoMatrix);
  }
}

export function listenForDocumentChanges(
  editor: TextEditor,
  selections: Selection[][]
): Promise<Selection[][]> {
  return new Promise((resolve) => {
    const matrix = selectionsToSelectionInfos(editor.document, selections);

    const disposable = workspace.onDidChangeTextDocument(
      (event: TextDocumentChangeEvent) => {
        if (
          event.document !== editor.document ||
          event.contentChanges.length === 0
        ) {
          return;
        }

        // Only listen for the one event
        disposable.dispose();

        updateSelectionInfoMatrix(event.contentChanges, matrix);

        const returnValue = selectionInfosToSelections(event.document, matrix);
        resolve(returnValue);
      }
    );
  });
}
