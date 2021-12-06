import { DecorationRangeBehavior, Selection } from "vscode";
import { flatten } from "lodash";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Edit,
  Graph,
  SelectionWithEditor,
  TypedSelection,
} from "../typings/Types";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import { decorationSleep } from "../util/editDisplayUtils";
import { FullSelectionInfo } from "../typings/updateSelections";
import {
  getSelectionInfo,
  performEditsAndUpdateFullSelectionInfos,
} from "../core/updateSelections/updateSelections";

export default class Rewrap implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    {
      insideOutsideType: "inside",
      modifier: {
        type: "surroundingPair",
        delimiter: "any",
        delimiterInclusion: undefined,
      },
    },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [TypedSelection[]],
    left: string,
    right: string
  ): Promise<ActionReturnValue> {
    const thatMark = flatten(
      await runOnTargetsForEachEditor<SelectionWithEditor[]>(
        targets,
        async (editor, targets) => {
          const { document } = editor;

          const boundaries = targets.map((target) => {
            const boundary = target.selectionContext.boundary;

            if (boundary == null || boundary.length !== 2) {
              throw Error("Target must have an opening and closing delimiter");
            }

            const [start, end] = boundary;

            return {
              start: start.selection,
              end: end.selection,
            };
          });

          const edits: Edit[] = boundaries.flatMap(({ start, end }) => [
            {
              text: left,
              range: start,
            },
            {
              text: right,
              range: end,
            },
          ]);

          const delimiterSelectionInfos: FullSelectionInfo[] =
            boundaries.flatMap(({ start, end }) => {
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
            });

          const cursorSelectionInfos = editor.selections.map((selection) =>
            getSelectionInfo(
              document,
              selection,
              DecorationRangeBehavior.ClosedClosed
            )
          );

          const thatMarkSelectionInfos = targets.map(
            ({ selection: { selection } }) =>
              getSelectionInfo(
                document,
                selection,
                DecorationRangeBehavior.OpenOpen
              )
          );

          const [delimiterSelections, cursorSelections, thatMarkSelections] =
            await performEditsAndUpdateFullSelectionInfos(
              this.graph.rangeUpdater,
              editor,
              edits,
              [
                delimiterSelectionInfos,
                cursorSelectionInfos,
                thatMarkSelectionInfos,
              ]
            );

          editor.selections = cursorSelections;

          editor.setDecorations(
            this.graph.editStyles.justAdded.token,
            delimiterSelections
          );
          await decorationSleep();
          editor.setDecorations(this.graph.editStyles.justAdded.token, []);

          return thatMarkSelections.map((selection) => ({
            editor,
            selection,
          }));
        }
      )
    );

    return { thatMark };
  }
}
