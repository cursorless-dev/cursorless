import { flatten } from "lodash";
import {
  DecorationRangeBehavior,
  Range,
  Selection,
  TextDocument,
  TextEditor,
} from "vscode";
import { Edit } from "../../typings/Types";
import {
  FullSelectionInfo,
  SelectionInfo,
} from "../../typings/updateSelections";
import { performDocumentEdits } from "../../util/performDocumentEdits";
import { isForward } from "../../util/selectionUtils";
import { RangeUpdater } from "./RangeUpdater";

interface SelectionsWithBehavior {
  selections: readonly Selection[];
  rangeBehavior?: DecorationRangeBehavior;
}

/**
 * Given a selection, this function creates a `SelectionInfo` object that can
 * be passed in to any of the commands that update selections.
 *
 * @param document The document containing the selection
 * @param selection The selection
 * @param rangeBehavior How selection should behave with respect to insertions on either end
 * @returns An object that can be used for selection tracking
 */
export function getSelectionInfo(
  document: TextDocument,
  selection: Selection,
  rangeBehavior: DecorationRangeBehavior
): FullSelectionInfo {
  return getSelectionInfoInternal(
    document,
    selection,
    isForward(selection),
    rangeBehavior
  );
}

function getSelectionInfoInternal(
  document: TextDocument,
  range: Range,
  isForward: boolean,
  rangeBehavior: DecorationRangeBehavior
): FullSelectionInfo {
  return {
    range,
    isForward,
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
      start: document.offsetAt(range.start),
      end: document.offsetAt(range.end),
    },
    text: document.getText(range),
  };
}

/**
 * Creates SelectionInfo objects for all selections in a list of lists.
 *
 * @param document The document containing the selections
 * @param selectionMatrix A list of lists of selections
 * @param rangeBehavior How selections should behave with respect to insertions on either end
 * @returns A list of lists of selection info objects
 */
function selectionsToSelectionInfos(
  document: TextDocument,
  selectionMatrix: (readonly Selection[])[],
  rangeBehavior: DecorationRangeBehavior = DecorationRangeBehavior.ClosedClosed
): FullSelectionInfo[][] {
  return selectionMatrix.map((selections) =>
    selections.map((selection) =>
      getSelectionInfo(document, selection, rangeBehavior)
    )
  );
}

function rangesToSelectionInfos(
  document: TextDocument,
  rangeMatrix: (readonly Range[])[],
  rangeBehavior: DecorationRangeBehavior = DecorationRangeBehavior.ClosedClosed
): FullSelectionInfo[][] {
  return rangeMatrix.map((ranges) =>
    ranges.map((range) =>
      getSelectionInfoInternal(document, range, false, rangeBehavior)
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

function selectionInfosToSelections(
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
 * @param rangeUpdater A RangeUpdate instance that will perform actual range updating
 * @param func The function to call
 * @param document The document containing the selections
 * @param selectionMatrix A matrix of selections to update
 * @returns The initial selections updated based upon what happened in the function
 */
export async function callFunctionAndUpdateSelections(
  rangeUpdater: RangeUpdater,
  func: () => Thenable<void>,
  document: TextDocument,
  selectionMatrix: (readonly Selection[])[]
): Promise<Selection[][]> {
  const selectionInfoMatrix = selectionsToSelectionInfos(
    document,
    selectionMatrix
  );

  return await callFunctionAndUpdateSelectionInfos(
    rangeUpdater,
    func,
    document,
    selectionInfoMatrix
  );
}

export async function callFunctionAndUpdateRanges(
  rangeUpdater: RangeUpdater,
  func: () => Thenable<void>,
  document: TextDocument,
  rangeMatrix: (readonly Range[])[]
): Promise<Range[][]> {
  const selectionInfoMatrix = rangesToSelectionInfos(document, rangeMatrix);

  return await callFunctionAndUpdateSelectionInfos(
    rangeUpdater,
    func,
    document,
    selectionInfoMatrix
  );
}

/**
 * Calls the given function and updates the given selections based on the
 * changes that occurred as a result of calling function.
 * @param rangeUpdater A RangeUpdate instance that will perform actual range updating
 * @param func The function to call
 * @param document The document containing the selections
 * @param selectionInfoMatrix A matrix of selection info objects to update
 * @returns The initial selections updated based upon what happened in the function
 */
export async function callFunctionAndUpdateSelectionInfos(
  rangeUpdater: RangeUpdater,
  func: () => Thenable<void>,
  document: TextDocument,
  selectionInfoMatrix: FullSelectionInfo[][]
) {
  const unsubscribe = rangeUpdater.registerRangeInfoList(
    document,
    flatten(selectionInfoMatrix)
  );

  await func();

  unsubscribe();

  return selectionInfosToSelections(selectionInfoMatrix);
}

/**
 * Performs a list of edits and returns the given selections updated based on
 * the applied edits
 * @param rangeUpdater A RangeUpdate instance that will perform actual range updating
 * @param func The function to call
 * @param document The document containing the selections
 * @param originalSelections The selections to update
 * @returns The updated selections
 */
export function callFunctionAndUpdateSelectionsWithBehavior(
  rangeUpdater: RangeUpdater,
  func: () => Thenable<void>,
  document: TextDocument,
  originalSelections: SelectionsWithBehavior[]
) {
  return callFunctionAndUpdateSelectionInfos(
    rangeUpdater,
    func,
    document,
    originalSelections.map((selectionsWithBehavior) =>
      selectionsWithBehavior.selections.map((selection) =>
        getSelectionInfo(
          document,
          selection,
          selectionsWithBehavior.rangeBehavior ??
            DecorationRangeBehavior.ClosedClosed
        )
      )
    )
  );
}

/**
 * Performs a list of edits and returns the given selections updated based on
 * the applied edits
 * @param rangeUpdater A RangeUpdate instance that will perform actual range updating
 * @param editor The editor containing the selections
 * @param edits A list of edits to apply
 * @param originalSelections The selections to update
 * @returns The updated selections
 */
export async function performEditsAndUpdateSelections(
  rangeUpdater: RangeUpdater,
  editor: TextEditor,
  edits: Edit[],
  originalSelections: (readonly Selection[])[]
) {
  const document = editor.document;
  const selectionInfoMatrix = selectionsToSelectionInfos(
    document,
    originalSelections
  );
  return performEditsAndUpdateInternal(
    rangeUpdater,
    editor,
    edits,
    selectionInfoMatrix
  );
}

/**
 * Performs a list of edits and returns the given selections updated based on
 * the applied edits
 * @param rangeUpdater A RangeUpdate instance that will perform actual range updating
 * @param editor The editor containing the selections
 * @param edits A list of edits to apply
 * @param originalSelections The selections to update
 * @param rangeBehavior How selections should behave with respect to insertions on either end
 * @returns The updated selections
 */
export function performEditsAndUpdateSelectionsWithBehavior(
  rangeUpdater: RangeUpdater,
  editor: TextEditor,
  edits: Edit[],
  originalSelections: SelectionsWithBehavior[]
) {
  return performEditsAndUpdateFullSelectionInfos(
    rangeUpdater,
    editor,
    edits,
    originalSelections.map((selectionsWithBehavior) =>
      selectionsWithBehavior.selections.map((selection) =>
        getSelectionInfo(
          editor.document,
          selection,
          selectionsWithBehavior.rangeBehavior ??
            DecorationRangeBehavior.ClosedClosed
        )
      )
    )
  );
}

export async function performEditsAndUpdateRanges(
  rangeUpdater: RangeUpdater,
  editor: TextEditor,
  edits: Edit[],
  originalRanges: (readonly Range[])[]
): Promise<Range[][]> {
  const document = editor.document;
  const selectionInfoMatrix = rangesToSelectionInfos(document, originalRanges);
  return performEditsAndUpdateInternal(
    rangeUpdater,
    editor,
    edits,
    selectionInfoMatrix
  );
}

async function performEditsAndUpdateInternal(
  rangeUpdater: RangeUpdater,
  editor: TextEditor,
  edits: Edit[],
  selectionInfoMatrix: FullSelectionInfo[][]
) {
  await performEditsAndUpdateFullSelectionInfos(
    rangeUpdater,
    editor,
    edits,
    selectionInfoMatrix
  );
  return selectionInfosToSelections(selectionInfoMatrix);
}

// TODO: Remove this function if we don't end up using it for the next couple use cases, eg `that` mark and cursor history
export async function performEditsAndUpdateSelectionInfos(
  rangeUpdater: RangeUpdater,
  editor: TextEditor,
  edits: Edit[],
  originalSelectionInfos: SelectionInfo[][]
): Promise<Selection[][]> {
  fillOutSelectionInfos(editor.document, originalSelectionInfos);

  return await performEditsAndUpdateFullSelectionInfos(
    rangeUpdater,
    editor,
    edits,
    originalSelectionInfos as FullSelectionInfo[][]
  );
}

/**
 * Performs a list of edits and returns the given selections updated based on
 * the applied edits
 * @param rangeUpdater A RangeUpdate instance that will perform actual range updating
 * @param editor The editor containing the selections
 * @param edits A list of edits to apply
 * @param originalSelectionInfos The selection info objects to update
 * @returns The updated selections
 */
export async function performEditsAndUpdateFullSelectionInfos(
  rangeUpdater: RangeUpdater,
  editor: TextEditor,
  edits: Edit[],
  originalSelectionInfos: FullSelectionInfo[][]
): Promise<Selection[][]> {
  // NB: We do everything using VSCode listeners.  We can associate changes
  // with our changes just by looking at their offets / text in order to
  // recover isReplace.  We need to do this because VSCode does some fancy
  // stuff, and returns the changes in a nice order
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
  // - We have a component on the graph called graph.rangeUpdater
  // - It supports registering a list of selections to keep up-to-date, and
  //   it returns a dispose function.
  // - It also has a function that allows callers to register isReplace edits,
  //   and it will look those up when it receives edits in order to set that
  //   field.

  const func = async () => {
    const wereEditsApplied = await performDocumentEdits(
      rangeUpdater,
      editor,
      edits
    );

    if (!wereEditsApplied) {
      throw new Error("Could not apply edits");
    }
  };

  await callFunctionAndUpdateSelectionInfos(
    rangeUpdater,
    func,
    editor.document,
    originalSelectionInfos
  );

  return selectionInfosToSelections(originalSelectionInfos);
}
