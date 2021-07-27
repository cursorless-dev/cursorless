import {
  Selection,
  Range,
  TextEditor,
  workspace,
  TextDocument,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
  Disposable,
} from "vscode";
import { performDocumentEdits } from "./performDocumentEdits";
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
      // The built in isReversed is bugged on empty selection. don't use
      isReversed: selection.active.isBefore(selection.anchor),
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
        // Change is selection. Move just end to match.
        if (change.range.isEqual(selectionInfo.range)) {
          selectionInfo.endOffset += offsetDelta;
        }
        // Change is before selection. Move entire selection.
        else if (
          change.range.start.isBeforeOrEqual(selectionInfo.range.start)
        ) {
          selectionInfo.startOffset += offsetDelta;
          selectionInfo.endOffset += offsetDelta;
        }
      });
    });
  });
}

class SelectionUpdater {
  private document: TextDocument;
  private selectionInfoMatrix: SelectionInfo[][];
  private disposable!: Disposable;

  constructor(editor: TextEditor, originalSelections: Selection[][]) {
    this.document = editor.document;
    this.selectionInfoMatrix = selectionsToSelectionInfos(
      this.document,
      originalSelections
    );
    this.listenForDocumentChanges();
  }

  private listenForDocumentChanges() {
    this.disposable = workspace.onDidChangeTextDocument(
      (event: TextDocumentChangeEvent) => {
        if (
          event.document !== this.document ||
          event.contentChanges.length === 0
        ) {
          return;
        }

        updateSelectionInfoMatrix(
          event.contentChanges,
          this.selectionInfoMatrix
        );
      }
    );
  }

  dispose() {
    this.disposable.dispose();
  }

  /**
   * Call this function after applying the document edits to get the updated
   * selection ranges.
   *
   * @returns Original selections updated to take into account the given changes
   */
  get updatedSelections() {
    return selectionInfosToSelections(this.document, this.selectionInfoMatrix);
  }
}

/**
 * Calls the given function and updates the given selections based on the
 * changes that occurred as a result of calling function.
 * @param func The function to call
 * @param editor The editor containing the selections
 * @param selectionMatrix A matrix of selections to update
 * @returns The initial selections updated based upon what happened in the function
 */
export async function callFunctionAndUpdateSelections(
  func: () => Thenable<void>,
  editor: TextEditor,
  selectionMatrix: Selection[][]
): Promise<Selection[][]> {
  const selectionUpdater = new SelectionUpdater(editor, selectionMatrix);

  await func();

  selectionUpdater.dispose();

  return selectionUpdater.updatedSelections;
}

/**
 * Performs a list of edits and returns the given selections updated based on
 * the applied edits
 * @param editor The editor containing the selections
 * @param edits A list of edits to apply
 * @param originalSelections The selections to update
 * @returns The updated selections
 */
export async function performEditsAndUpdateSelections(
  editor: TextEditor,
  edits: Edit[],
  originalSelections: Selection[][]
) {
  const document = editor.document;
  const selectionInfoMatrix = selectionsToSelectionInfos(
    document,
    originalSelections
  );
  const contentChanges = edits.map(({ range, text }) => ({
    range,
    text,
    rangeOffset: document.offsetAt(range.start),
    rangeLength: document.offsetAt(range.end) - document.offsetAt(range.start),
  }));

  const wereEditsApplied = await performDocumentEdits(editor, edits);

  if (!wereEditsApplied) {
    throw new Error("Could not apply edits");
  }

  updateSelectionInfoMatrix(contentChanges, selectionInfoMatrix);

  return selectionInfosToSelections(document, selectionInfoMatrix);
}
