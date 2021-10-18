import {
  Selection,
  TextEditor,
  workspace,
  TextDocument,
  TextDocumentChangeEvent,
  Disposable,
  EndOfLine,
  DecorationRangeBehavior,
} from "vscode";
import { performDocumentEdits } from "./performDocumentEdits";
import { Edit } from "../typings/Types";
import { flatten } from "lodash";
import {
  ExtendedTextDocumentChangeEvent,
  FullRangeInfo,
  updateRangeInfos,
} from "./updateRangeInfos";
import { isForward } from "./selectionUtils";

export interface SelectionInfo extends FullRangeInfo {
  isForward: boolean;
}

function selectionsToSelectionInfos(
  document: TextDocument,
  selectionMatrix: Selection[][]
): SelectionInfo[][] {
  return selectionMatrix.map((selections) =>
    selections.map((selection) => ({
      range: selection,
      isForward: isForward(selection),
      expansionBehavior: { start: { type: "closed" }, end: { type: "closed" } },
      offsets: {
        start: document.offsetAt(selection.start),
        end: document.offsetAt(selection.end),
      },
      text: document.getText(selection),
    }))
  );
}

function updateSelectionInfoMatrix(
  changeEvent: ExtendedTextDocumentChangeEvent,
  selectionInfoMatrix: SelectionInfo[][]
) {
  updateRangeInfos(changeEvent, flatten(selectionInfoMatrix));
}

class SelectionUpdater {
  private document: TextDocument;
  private selectionInfoMatrix: SelectionInfo[][];
  private disposable!: Disposable;

  constructor(
    editor: TextEditor,
    originalSelections: Selection[][],
    private rangeBehavior?: DecorationRangeBehavior
  ) {
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
          event,
          this.selectionInfoMatrix,
          this.rangeBehavior
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
    return this.selectionInfoMatrix.map((selectionInfos) =>
      selectionInfos.map(({ range }) => range)
    );
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
  func: () => Thenable<unknown>,
  editor: TextEditor,
  selectionMatrix: Selection[][],
  rangeBehavior?: DecorationRangeBehavior
): Promise<Selection[][]> {
  const selectionUpdater = new SelectionUpdater(
    editor,
    selectionMatrix,
    rangeBehavior
  );

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

  return performEditsAndUpdateSelectionInfos(
    editor,
    edits,
    selectionInfoMatrix
  );
}

export async function performEditsAndUpdateSelectionInfos(
  editor: TextEditor,
  edits: Edit[],
  originalSelectionInfos: SelectionInfo[][]
) {
  const document = editor.document;

  const contentChanges = edits.map(({ range, text, isReplace }) => ({
    range,
    text,
    rangeOffset: document.offsetAt(range.start),
    rangeLength: document.offsetAt(range.end) - document.offsetAt(range.start),
    isReplace,
  }));

  // Replace \n with \r\n. Vscode does this internally and it's
  // important that our calculated changes reflect the actual changes
  if (document.eol === EndOfLine.CRLF) {
    contentChanges.forEach((change) => {
      change.text = change.text.replace(/(?<!\r)\n/g, "\r\n");
    });
  }

  const wereEditsApplied = await performDocumentEdits(editor, edits);

  if (!wereEditsApplied) {
    throw new Error("Could not apply edits");
  }

  updateSelectionInfoMatrix(
    { document, contentChanges },
    originalSelectionInfos
  );

  return selectionInfosToSelections(document, originalSelectionInfos);
}
