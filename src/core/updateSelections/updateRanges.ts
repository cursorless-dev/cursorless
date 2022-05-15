import { flatten } from "lodash";
import {
  DecorationRangeBehavior,
  Range,
  TextDocument,
  TextEditor,
} from "vscode";
import { Edit } from "../../typings/Types";
import { FullRangeInfo, RangeInfo } from "../../typings/updateSelections";
import { performDocumentEdits } from "../../util/performDocumentEdits";
import { RangeUpdater } from "./RangeUpdater";

/**
 * Given a selection, this function creates a `SelectionInfo` object that can
 * be passed in to any of the commands that update selections.
 *
 * @param document The document containing the selection
 * @param range The range
 * @param rangeBehavior How selection should behave with respect to insertions on either end
 * @returns An object that can be used for selection tracking
 */
function getRangeInfo(
  document: TextDocument,
  range: Range,
  rangeBehavior: DecorationRangeBehavior
): FullRangeInfo {
  return {
    range: new Range(range.start, range.end),
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
 * @param rangeMatrix A list of lists of selections
 * @param rangeBehavior How selections should behave with respect to insertions on either end
 * @returns A list of lists of selection info objects
 */
function rangesToRangeInfos(
  document: TextDocument,
  rangeMatrix: (readonly Range[])[],
  rangeBehavior: DecorationRangeBehavior = DecorationRangeBehavior.ClosedClosed
): FullRangeInfo[][] {
  return rangeMatrix.map((ranges) =>
    ranges.map((range) => getRangeInfo(document, range, rangeBehavior))
  );
}

function rangeInfosToRanges(rangeInfoMatrix: RangeInfo[][]): Range[][] {
  return rangeInfoMatrix.map((rangeInfos) =>
    rangeInfos.map(({ range }) => range)
  );
}

/**
 * Calls the given function and updates the given selections based on the
 * changes that occurred as a result of calling function.
 * @param rangeUpdater A RangeUpdate instance that will perform actual range updating
 * @param func The function to call
 * @param document The document containing the selections
 * @param rangeMatrix A matrix of selections to update
 * @returns The initial selections updated based upon what happened in the function
 */
export async function callFunctionAndUpdateRanges(
  rangeUpdater: RangeUpdater,
  func: () => Thenable<unknown>,
  document: TextDocument,
  rangeMatrix: (readonly Range[])[]
): Promise<Range[][]> {
  const rangeInfoMatrix = rangesToRangeInfos(document, rangeMatrix);

  return await callFunctionAndUpdateSelectionInfos(
    rangeUpdater,
    func,
    document,
    rangeInfoMatrix
  );
}

/**
 * Calls the given function and updates the given selections based on the
 * changes that occurred as a result of calling function.
 * @param rangeUpdater A RangeUpdate instance that will perform actual range updating
 * @param func The function to call
 * @param document The document containing the selections
 * @param selectionMatrix A matrix of selection info objects to update
 * @returns The initial selections updated based upon what happened in the function
 */
export async function callFunctionAndUpdateSelectionInfos(
  rangeUpdater: RangeUpdater,
  func: () => Thenable<unknown>,
  document: TextDocument,
  rangeInfoMatrix: FullRangeInfo[][]
) {
  const unsubscribe = rangeUpdater.registerRangeInfoList(
    document,
    flatten(rangeInfoMatrix)
  );

  await func();

  unsubscribe();

  return rangeInfosToRanges(rangeInfoMatrix);
}

/**
 * Performs a list of edits and returns the given selections updated based on
 * the applied edits
 * @param rangeUpdater A RangeUpdate instance that will perform actual range updating
 * @param editor The editor containing the selections
 * @param edits A list of edits to apply
 * @param originalRanges The selections to update
 * @returns The updated selections
 */
export async function performEditsAndUpdateRanges(
  rangeUpdater: RangeUpdater,
  editor: TextEditor,
  edits: Edit[],
  originalRanges: (readonly Range[])[]
) {
  const document = editor.document;
  const selectionInfoMatrix = rangesToRangeInfos(document, originalRanges);

  await performEditsAndUpdateFullSelectionInfos(
    rangeUpdater,
    editor,
    edits,
    selectionInfoMatrix
  );

  return rangeInfosToRanges(selectionInfoMatrix);
}

/**
 * Performs a list of edits and returns the given selections updated based on
 * the applied edits
 * @param rangeUpdater A RangeUpdate instance that will perform actual range updating
 * @param editor The editor containing the selections
 * @param edits A list of edits to apply
 * @param originalRangeInfos The selection info objects to update
 * @returns The updated selections
 */
export async function performEditsAndUpdateFullSelectionInfos(
  rangeUpdater: RangeUpdater,
  editor: TextEditor,
  edits: Edit[],
  originalRangeInfos: FullRangeInfo[][]
) {
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
    originalRangeInfos
  );

  return rangeInfosToRanges(originalRangeInfos);
}
