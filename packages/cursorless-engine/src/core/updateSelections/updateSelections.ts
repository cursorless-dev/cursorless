import {
  Edit,
  EditableTextEditor,
  Range,
  RangeExpansionBehavior,
  Selection,
  TextDocument,
} from "@cursorless/common";
import { flatten } from "lodash-es";
import {
  FullSelectionInfo,
  SelectionInfo,
} from "../../typings/updateSelections";
import { performDocumentEdits } from "../../util/performDocumentEdits";
import { RangeUpdater } from "./RangeUpdater";

abstract class Updater {
  protected _selections: SelectionsWithBehavior[] = [];
  protected _ranges: RangesWithBehavior[] = [];
  protected _updateEditorSelections = false;

  constructor(protected editor: EditableTextEditor) {}

  selections(
    selections: Selection[],
    rangeBehavior: RangeExpansionBehavior = RangeExpansionBehavior.closedClosed,
  ): this {
    this._selections.push({ selections, rangeBehavior });
    return this;
  }

  ranges(
    ranges: Range[],
    rangeBehavior: RangeExpansionBehavior = RangeExpansionBehavior.closedClosed,
  ): this {
    this._ranges.push({ ranges, rangeBehavior });
    return this;
  }

  updateEditorSelections(): this {
    this._updateEditorSelections = true;
    return this;
  }

  async run(): Promise<{
    selections: Selection[][];
    ranges: Range[][];
  }> {
    const allSelections = this._updateEditorSelections
      ? this._selections.concat({
          selections: this.editor.selections,
          rangeBehavior: RangeExpansionBehavior.closedClosed,
        })
      : this._selections;

    const selectionInfos = allSelections.map(({ selections, rangeBehavior }) =>
      selections.map((selection) =>
        getSelectionInfo(this.editor.document, selection, rangeBehavior),
      ),
    );

    const rangeInfos = this._ranges.map(({ ranges, rangeBehavior }) =>
      ranges.map((range) =>
        getSelectionInfoInternal(
          this.editor.document,
          range,
          true,
          rangeBehavior,
        ),
      ),
    );

    const updatedSelectionsMatrix = await this.runInternal(
      selectionInfos.concat(rangeInfos),
    );

    const updatedSelections = updatedSelectionsMatrix.slice(
      0,
      selectionInfos.length,
    );
    const updatedRanges = updatedSelectionsMatrix.slice(selectionInfos.length);

    if (this._updateEditorSelections) {
      const updatedEditorSelections = updatedSelections.pop()!;
      await this.editor.setSelections(updatedEditorSelections);
    }

    return {
      selections: updatedSelections,
      ranges: updatedRanges,
    };
  }

  protected abstract runInternal(
    selectionInfos: FullSelectionInfo[][],
  ): Promise<Selection[][]>;
}

/**
 * Updates selections and ranges in an editor based on a list of edits.
 */
export class EditsUpdater extends Updater {
  constructor(
    private rangeUpdater: RangeUpdater,
    editor: EditableTextEditor,
    private edits: Edit[],
  ) {
    super(editor);
  }

  protected runInternal(
    selectionInfos: FullSelectionInfo[][],
  ): Promise<Selection[][]> {
    return performEditsAndUpdateFullSelectionInfos(
      this.rangeUpdater,
      this.editor,
      this.edits,
      selectionInfos,
    );
  }
}

/**
 * Updates selections and ranges in an editor based on a callback function.
 */
export class CallbackUpdater extends Updater {
  constructor(
    private rangeUpdater: RangeUpdater,
    editor: EditableTextEditor,
    private callback: () => Promise<void>,
  ) {
    super(editor);
  }

  protected runInternal(
    selectionInfos: FullSelectionInfo[][],
  ): Promise<Selection[][]> {
    return callFunctionAndUpdateFullSelectionInfos(
      this.rangeUpdater,
      this.callback,
      this.editor.document,
      selectionInfos,
    );
  }
}

interface SelectionsWithBehavior {
  selections: readonly Selection[];
  rangeBehavior: RangeExpansionBehavior;
}

interface RangesWithBehavior {
  ranges: readonly Range[];
  rangeBehavior: RangeExpansionBehavior;
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
function getSelectionInfo(
  document: TextDocument,
  selection: Selection,
  rangeBehavior: RangeExpansionBehavior,
): FullSelectionInfo {
  return getSelectionInfoInternal(
    document,
    selection,
    !selection.isReversed,
    rangeBehavior,
  );
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
