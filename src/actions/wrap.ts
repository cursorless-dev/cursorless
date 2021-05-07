import { Range, Selection } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  SelectionWithEditor,
  TypedSelection,
} from "../Types";
import { runForEachEditor } from "../targetUtils";
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
      await runForEachEditor<SelectionWithEditor[]>(
        targets,
        async (editor, selections) => {
          const originalInsertions = flatten(
            selections.map((selection, index) => [
              {
                originalOffset: editor.document.offsetAt(
                  selection.selection.selection.start
                ),
                length: left.length,
                selectionIndex: index,
                side: "left",
              },
              {
                originalOffset: editor.document.offsetAt(
                  selection.selection.selection.end
                ),
                length: right.length,
                selectionIndex: index,
                side: "right",
              },
            ])
          );

          const newInsertions = zip(
            originalInsertions,
            computeChangedOffsets(
              originalInsertions.map((insertion) => ({
                startOffset: insertion.originalOffset,
                endOffset: insertion.originalOffset,
                newTextLength: insertion.length,
              }))
            )
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
            this.graph.editStyles.justAdded,
            newInsertions.map(
              ({ newStartOffset, newEndOffset }) =>
                new Range(
                  editor.document.positionAt(newStartOffset),
                  editor.document.positionAt(newEndOffset)
                )
            )
          );

          await decorationSleep();

          editor.setDecorations(this.graph.editStyles.justAdded, []);

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
