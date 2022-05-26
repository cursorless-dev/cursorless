import { DecorationRangeBehavior, Selection } from "vscode";
import {
  getSelectionInfo,
  performEditsAndUpdateFullSelectionInfos,
} from "../core/updateSelections/updateSelections";
import { Target } from "../typings/target.types";
import { Edit, Graph } from "../typings/Types";
import { FullSelectionInfo } from "../typings/updateSelections";
import { decorationSleep } from "../util/editDisplayUtils";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class Wrap implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    left: string,
    right: string
  ): Promise<ActionReturnValue> {
    const results = await runOnTargetsForEachEditor(
      targets,
      async (editor, targets) => {
        const { document } = editor;
        const boundaries = targets.map((target) => ({
          start: new Selection(
            target.contentRange.start,
            target.contentRange.start
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
                DecorationRangeBehavior.OpenClosed
              ),
              getSelectionInfo(
                document,
                end,
                DecorationRangeBehavior.ClosedOpen
              ),
            ];
          }
        );

        const cursorSelectionInfos = editor.selections.map((selection) =>
          getSelectionInfo(
            document,
            selection,
            DecorationRangeBehavior.ClosedClosed
          )
        );

        const sourceMarkSelectionInfos = targets.map((target) =>
          getSelectionInfo(
            document,
            target.contentSelection,
            DecorationRangeBehavior.ClosedClosed
          )
        );

        const thatMarkSelectionInfos = targets.map((target) =>
          getSelectionInfo(
            document,
            target.contentSelection,
            DecorationRangeBehavior.OpenOpen
          )
        );

        const [
          delimiterSelections,
          cursorSelections,
          sourceMarkSelections,
          thatMarkSelections,
        ] = await performEditsAndUpdateFullSelectionInfos(
          this.graph.rangeUpdater,
          editor,
          edits,
          [
            delimiterSelectionInfos,
            cursorSelectionInfos,
            sourceMarkSelectionInfos,
            thatMarkSelectionInfos,
          ]
        );

        setSelectionsWithoutFocusingEditor(editor, cursorSelections);

        editor.setDecorations(
          this.graph.editStyles.justAdded.token,
          delimiterSelections
        );
        await decorationSleep();
        editor.setDecorations(this.graph.editStyles.justAdded.token, []);

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
      }
    );

    return {
      sourceMark: results.flatMap(({ sourceMark }) => sourceMark),
      thatMark: results.flatMap(({ thatMark }) => thatMark),
    };
  }
}
