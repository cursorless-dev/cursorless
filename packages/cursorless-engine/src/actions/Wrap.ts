import {
  FlashStyle,
  RangeExpansionBehavior,
  Selection,
  toCharacterRange,
} from "@cursorless/common";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import {
  getSelectionInfo,
  performEditsAndUpdateFullSelectionInfos,
} from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import type { Edit } from "../typings/Types";
import type { Target } from "../typings/target.types";
import type { FullSelectionInfo } from "../typings/updateSelections";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export default class Wrap {
  constructor(private rangeUpdater: RangeUpdater) {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    left: string,
    right: string,
  ): Promise<ActionReturnValue> {
    const results = await runOnTargetsForEachEditor(
      targets,
      async (editor, targets) => {
        const { document } = editor;
        const boundaries = targets.map((target) => ({
          start: new Selection(
            target.contentRange.start,
            target.contentRange.start,
          ),
          end: new Selection(target.contentRange.end, target.contentRange.end),
        }));

        const edits: Edit[] = boundaries.flatMap(({ start, end }) => [
          {
            text: left,
            range: start,
          },
          {
            text: right,
            range: end,
            isReplace: true,
          },
        ]);

        const delimiterSelectionInfos: FullSelectionInfo[] = boundaries.flatMap(
          ({ start, end }) => {
            return [
              getSelectionInfo(
                document,
                start,
                RangeExpansionBehavior.openClosed,
              ),
              getSelectionInfo(
                document,
                end,
                RangeExpansionBehavior.closedOpen,
              ),
            ];
          },
        );

        const cursorSelectionInfos = editor.selections.map((selection) =>
          getSelectionInfo(
            document,
            selection,
            RangeExpansionBehavior.closedClosed,
          ),
        );

        const sourceMarkSelectionInfos = targets.map((target) =>
          getSelectionInfo(
            document,
            target.contentSelection,
            RangeExpansionBehavior.closedClosed,
          ),
        );

        const thatMarkSelectionInfos = targets.map((target) =>
          getSelectionInfo(
            document,
            target.contentSelection,
            RangeExpansionBehavior.openOpen,
          ),
        );

        const editableEditor = ide().getEditableTextEditor(editor);

        const [
          delimiterSelections,
          cursorSelections,
          sourceMarkSelections,
          thatMarkSelections,
        ] = await performEditsAndUpdateFullSelectionInfos(
          this.rangeUpdater,
          editableEditor,
          edits,
          [
            delimiterSelectionInfos,
            cursorSelectionInfos,
            sourceMarkSelectionInfos,
            thatMarkSelectionInfos,
          ],
        );

        setSelectionsWithoutFocusingEditor(editableEditor, cursorSelections);

        await ide().flashRanges(
          delimiterSelections.map((selection) => ({
            editor,
            range: toCharacterRange(selection),
            style: FlashStyle.justAdded,
          })),
        );

        return {
          sourceMark: sourceMarkSelections.map((selection) => ({
            editor,
            selection,
          })),
          thatMark: thatMarkSelections.map((selection) => ({
            editor,
            selection,
          })),
        };
      },
    );

    return {
      sourceSelections: results.flatMap(({ sourceMark }) => sourceMark),
      thatSelections: results.flatMap(({ thatMark }) => thatMark),
    };
  }
}
