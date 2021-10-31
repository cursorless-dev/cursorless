import {
  Selection,
  TextEditor,
  TextDocument,
  DecorationRangeBehavior,
} from "vscode";
import { flatten } from "lodash";
import {
  FullSelectionInfo,
  SelectionInfo,
} from "../../typings/updateSelections";
import { performDocumentEdits } from "../../util/performDocumentEdits";
import { isForward } from "../../util/selectionUtils";
import { Edit } from "../../typings/Types";
import { RangeUpdater } from "./RangeUpdater";

export function getSelectionInfo(
  document: TextDocument,
  selection: Selection,
  rangeBehavior: DecorationRangeBehavior
): FullSelectionInfo {
  return {
    range: selection,
    isForward: isForward(selection),
    expansionBehavior: {
      start: {
        type:
          rangeBehavior === DecorationRangeBehavior.ClosedClosed ||
          rangeBehavior === DecorationRangeBehavior.ClosedOpen
            ? "closed"
            : "open",
      },
      end: {
        type:
          rangeBehavior === DecorationRangeBehavior.ClosedClosed ||
          rangeBehavior === DecorationRangeBehavior.OpenClosed
            ? "closed"
            : "open",
      },
    },
    offsets: {
      start: document.offsetAt(selection.start),
      end: document.offsetAt(selection.end),
    },
    text: document.getText(selection),
  };
}

export function selectionsToSelectionInfos(
  document: TextDocument,
  selectionMatrix: Selection[][]
): FullSelectionInfo[][] {
  return selectionMatrix.map((selections) =>
    selections.map((selection) =>
      getSelectionInfo(
        document,
        selection,
        DecorationRangeBehavior.ClosedClosed
      )
    )
  );
}

function fillOutSelectionInfos(
  document: TextDocument,
  selectionInfoMatrix: SelectionInfo[][]
): selectionInfoMatrix is FullSelectionInfo[][] {
  selectionInfoMatrix.forEach((selectionInfos) =>
    selectionInfos.map((selectionInfo) => {
      const { range } = selectionInfo;
      Object.assign(selectionInfo, {
        offsets: {
          start: document.offsetAt(range.start),
          end: document.offsetAt(range.end),
        },
        text: document.getText(range),
      });
    })
  );
  return true;
}

export function selectionInfosToSelections(
  selectionInfoMatrix: SelectionInfo[][]
): Selection[][] {
  return selectionInfoMatrix.map((selectionInfos) =>
    selectionInfos.map(({ range: { start, end }, isForward }) =>
      isForward ? new Selection(start, end) : new Selection(end, start)
    )
  );
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
  selectionUpdater: RangeUpdater,
  func: () => Thenable<unknown>,
  document: TextDocument,
  selectionMatrix: Selection[][]
): Promise<Selection[][]> {
  const selectionInfoMatrix = selectionsToSelectionInfos(
    document,
    selectionMatrix
  );

  await callFunctionAndUpdateSelectionInfos(
    selectionUpdater,
    func,
    document,
    selectionInfoMatrix
  );

  return selectionInfosToSelections(selectionInfoMatrix);
}

/**
 * Calls the given function and updates the given selections based on the
 * changes that occurred as a result of calling function.
 * @param func The function to call
 * @param editor The editor containing the selections
 * @param selectionMatrix A matrix of selections to update
 * @returns The initial selections updated based upon what happened in the function
 */
export async function callFunctionAndUpdateSelectionInfos(
  selectionUpdater: RangeUpdater,
  func: () => Thenable<unknown>,
  document: TextDocument,
  selectionInfoMatrix: FullSelectionInfo[][]
): Promise<void> {
  const unsubscribe = selectionUpdater.registerRangeInfos(
    document,
    flatten(selectionInfoMatrix)
  );

  await func();

  unsubscribe();
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
  selectionUpdater: RangeUpdater,
  editor: TextEditor,
  edits: Edit[],
  originalSelections: Selection[][]
) {
  const document = editor.document;
  const selectionInfoMatrix = selectionsToSelectionInfos(
    document,
    originalSelections
  );

  await performEditsAndUpdateFullSelectionInfos(
    selectionUpdater,
    editor,
    edits,
    selectionInfoMatrix
  );

  return selectionInfosToSelections(selectionInfoMatrix);
}

export async function performEditsAndUpdateSelectionInfos(
  selectionUpdater: RangeUpdater,
  editor: TextEditor,
  edits: Edit[],
  originalSelectionInfos: SelectionInfo[][]
) {
  fillOutSelectionInfos(editor.document, originalSelectionInfos);

  return await performEditsAndUpdateFullSelectionInfos(
    selectionUpdater,
    editor,
    edits,
    originalSelectionInfos as FullSelectionInfo[][]
  );
}

export async function performEditsAndUpdateFullSelectionInfos(
  selectionUpdater: RangeUpdater,
  editor: TextEditor,
  edits: Edit[],
  originalSelectionInfos: FullSelectionInfo[][]
) {
  // TODO: Do everything using VSCode listeners.  We can associate changes with
  // our changes just by looking at their offets / text in order to recover
  // isReplace.  We need to do this because VSCode does some fancy stuff, and
  // returns the changes in a nice order
  // So this function would prob mostly go away, and everything would basically
  // just be a version of callFunctionAndUpdateSelections, or just call that
  // directly
  // Note that some additional weird edits like whitespace things can be
  // created by VSCode I believe, and they change order,  so we can't just zip
  // their changes with ours.
  // Their ordering basically is reverse document order, unless edits are at
  // the same location, in which case they're in reverse order of the changes
  // as you created them.
  // See
  // https://github.com/microsoft/vscode/blob/174db5eb992d880adcc42c41d83a0e6cb6b92474/src/vs/editor/common/core/range.ts#L430-L440
  // and
  // https://github.com/microsoft/vscode/blob/174db5eb992d880adcc42c41d83a0e6cb6b92474/src/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer.ts#L598-L604
  // See also
  // https://github.com/microsoft/vscode/blob/174db5eb992d880adcc42c41d83a0e6cb6b92474/src/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer.ts#L464
  // - We should have a component on the graph called graph.selectionUpdater
  // - It will support registering a list of selections to keep up-to-date, and
  //   it returns a dispose function.
  // - It also has a function that allows callers to register isReplace edits,
  //   and it will look those up when it receives edits in order to set that
  //   field.
  // - It should probably just store a list of lists of selectionInfos, and
  //   just remove the corresponding list when it gets deregistered
  // - Should clients register one list at a time or a list of lists?

  const func = async () => {
    const wereEditsApplied = await performDocumentEdits(
      selectionUpdater,
      editor,
      edits
    );

    if (!wereEditsApplied) {
      throw new Error("Could not apply edits");
    }
  };

  await callFunctionAndUpdateSelectionInfos(
    selectionUpdater,
    func,
    editor.document,
    originalSelectionInfos
  );

  return selectionInfosToSelections(originalSelectionInfos);
}
