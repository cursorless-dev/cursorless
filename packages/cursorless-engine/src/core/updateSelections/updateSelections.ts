import {
  Edit,
  EditableTextEditor,
  Range,
  RangeExpansionBehavior,
  Selection,
  TextDocument,
  unsafeKeys,
} from "@cursorless/common";
import { flatten } from "lodash-es";
import {
  FullSelectionInfo,
  SelectionInfo,
} from "../../typings/updateSelections";
import { performDocumentEdits } from "../../util/performDocumentEdits";
import { RangeUpdater } from "./RangeUpdater";

type SelectionsOrRanges = readonly Selection[] | readonly Range[];

interface SelectionsWithBehavior {
  selections: SelectionsOrRanges;
  behavior: RangeExpansionBehavior;
}

interface BaseProps<K extends string> {
  rangeUpdater: RangeUpdater;
  editor: EditableTextEditor;
  preserveEditorSelections?: boolean;
  selections: Record<K, SelectionsOrRanges | SelectionsWithBehavior>;
}

interface EditsProps<K extends string> extends BaseProps<K> {
  edits: Edit[];
}

interface CallbackProps<K extends string> extends BaseProps<K> {
  callback: () => Promise<void>;
}

type UpdaterProps<K extends string> = EditsProps<K> | CallbackProps<K>;

export async function performEditsAndUpdateSelections<K extends string>({
  rangeUpdater,
  editor,
  selections,
  preserveEditorSelections,
  ...rest
}: UpdaterProps<K>): Promise<Record<K, Selection[]>> {
  const keys = unsafeKeys(selections);

  const selectionInfos = keys.map((key) => {
    const selectionValue = selections[key];
    const selectionsWithBehavior = getsSelectionsWithBehavior(selectionValue);
    return getFullSelectionInfos(
      editor.document,
      selectionsWithBehavior.selections,
      selectionsWithBehavior.behavior,
    );
  });

  if (!preserveEditorSelections) {
    selectionInfos.push(
      getFullSelectionInfos(
        editor.document,
        editor.selections,
        RangeExpansionBehavior.closedClosed,
      ),
    );
  }

  const updatedSelectionsMatrix = await (() => {
    if ("edits" in rest) {
      return performEditsAndUpdateFullSelectionInfos(
        rangeUpdater,
        editor,
        rest.edits,
        selectionInfos,
      );
    }
    return callFunctionAndUpdateFullSelectionInfos(
      rangeUpdater,
      rest.callback,
      editor.document,
      selectionInfos,
    );
  })();

  if (!preserveEditorSelections) {
    await editor.setSelections(updatedSelectionsMatrix.pop()!);
  }

  const result = Object.fromEntries(
    keys.map((key, index) => [key, updatedSelectionsMatrix[index]]),
  );

  return result as Record<K, Selection[]>;
}

function getFullSelectionInfos(
  document: TextDocument,
  selections: readonly Selection[] | readonly Range[],
  rangeBehavior: RangeExpansionBehavior,
): FullSelectionInfo[] {
  return selections.map((selection) =>
    getSelectionInfoInternal(
      document,
      selection,
      selection instanceof Selection ? !selection.isReversed : true,
      rangeBehavior,
    ),
  );
}

function getSelectionsWithBehavior(
  selections: SelectionsOrRanges | SelectionsWithBehavior,
): SelectionsWithBehavior {
  if ("selections" in selections) {
    return selections;
  }
  return {
    selections,
    behavior: RangeExpansionBehavior.closedClosed,
  };
}

function getSelectionInfoInternal(
  document: TextDocument,
  range: Range,
  isForward: boolean,
  rangeBehavior: RangeExpansionBehavior,
): FullSelectionInfo {
  return {
    range,
    isForward,
    expansionBehavior: {
      start: {
        type:
          rangeBehavior === RangeExpansionBehavior.closedClosed ||
          rangeBehavior === RangeExpansionBehavior.closedOpen
            ? "closed"
            : "open",
      },
      end: {
        type:
          rangeBehavior === RangeExpansionBehavior.closedClosed ||
          rangeBehavior === RangeExpansionBehavior.openClosed
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

function selectionInfosToSelections(
  selectionInfoMatrix: SelectionInfo[][],
): Selection[][] {
  return selectionInfoMatrix.map((selectionInfos) =>
    selectionInfos.map(({ range: { start, end }, isForward }) =>
      isForward ? new Selection(start, end) : new Selection(end, start),
    ),
  );
}

/**
 * Calls the given function and updates the given selections based on the
 * changes that occurred as a result of calling function.
 * @param rangeUpdater A RangeUpdate instance that will perform actual range updating
 * @param func The function to call
 * @param document The document containing the selections
 * @param originalSelectionInfos The selection info objects to update
 * @returns The updated selections
 */
async function callFunctionAndUpdateFullSelectionInfos(
  rangeUpdater: RangeUpdater,
  func: () => Promise<void>,
  document: TextDocument,
  originalSelectionInfos: FullSelectionInfo[][],
) {
  const unsubscribe = rangeUpdater.registerRangeInfoList(
    document,
    flatten(originalSelectionInfos),
  );

  await func();

  unsubscribe();

  return selectionInfosToSelections(originalSelectionInfos);
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
async function performEditsAndUpdateFullSelectionInfos(
  rangeUpdater: RangeUpdater,
  editor: EditableTextEditor,
  edits: Edit[],
  originalSelectionInfos: FullSelectionInfo[][],
): Promise<Selection[][]> {
  // NB: We do everything using VSCode listeners.  We can associate changes
  // with our changes just by looking at their offsets / text in order to
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
  // - We have a component called rangeUpdater
  // - It supports registering a list of selections to keep up-to-date, and
  //   it returns a dispose function.
  // - It also has a function that allows callers to register isReplace edits,
  //   and it will look those up when it receives edits in order to set that
  //   field.

  const func = async () => {
    const wereEditsApplied = await performDocumentEdits(
      rangeUpdater,
      editor,
      edits,
    );

    if (!wereEditsApplied) {
      throw new Error("Could not apply edits");
    }
  };

  return await callFunctionAndUpdateFullSelectionInfos(
    rangeUpdater,
    func,
    editor.document,
    originalSelectionInfos,
  );
}
