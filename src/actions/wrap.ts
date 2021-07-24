import { Range, Selection } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  SelectionWithEditor,
  TypedSelection,
} from "../Types";
import { runOnTargetsForEachEditor } from "../targetUtils";
import { flatten, zip } from "lodash";
import { computeChangedOffsets } from "../computeChangedOffsets";
import { decorationSleep } from "../editDisplayUtils";

export default class Wrap implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

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
        async (editor, selections) => {
          const originalInsertions = flatten(
            selections.map((selection, index) => [
              {
                range: new Range(
                  selection.selection.selection.start,
                  selection.selection.selection.start
                ),
                newText: left,
                selectionIndex: index,
                side: "left",
              },
              {
                range: new Range(
                  selection.selection.selection.end,
                  selection.selection.selection.end
                ),
                newText: right,
                selectionIndex: index,
                side: "right",
              },
            ])
          );

          const newInsertions = zip(
            originalInsertions,
            computeChangedOffsets(editor, originalInsertions)
          ).map(([originalInsertion, changedInsertion]) => ({
            selectionIndex: originalInsertion!.selectionIndex,
            side: originalInsertion!.side,
            newStartOffset: changedInsertion!.startOffset,
            newEndOffset: changedInsertion!.endOffset,
          }));

          await editor.edit((editBuilder) => {
            selections.forEach((selection) => {
              editBuilder.insert(selection.selection.selection.start, left);
              editBuilder.insert(selection.selection.selection.end, right);
            });
          });

          editor.setDecorations(
            this.graph.editStyles.justAdded.token,
            newInsertions.map(
              ({ newStartOffset, newEndOffset }) =>
                new Range(
                  editor.document.positionAt(newStartOffset),
                  editor.document.positionAt(newEndOffset)
                )
            )
          );

          await decorationSleep();

          editor.setDecorations(this.graph.editStyles.justAdded.token, []);

          return selections.map((selection, index) => {
            const start = editor.document.positionAt(
              newInsertions.find(
                (insertion) =>
                  insertion.selectionIndex === index &&
                  insertion.side === "left"
              )!.newStartOffset
            );
            const end = editor.document.positionAt(
              newInsertions.find(
                (insertion) =>
                  insertion.selectionIndex === index &&
                  insertion.side === "right"
              )!.newEndOffset
            );

            const isReversed = selection.selection.selection.isReversed;

            return {
              editor,
              selection: new Selection(
                isReversed ? end : start,
                isReversed ? start : end
              ),
            };
          });
        }
      )
    );

    return { returnValue: null, thatMark };
  }
}
