import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { runForEachEditor, runOnTargetsForEachEditor } from "../targetUtils";
import update from "immutability-helper";
import displayPendingEditDecorations from "../editDisplayUtils";
import { computeChangedOffsets } from "../computeChangedOffsets";
import { flatten, zip } from "lodash";
import { Selection } from "vscode";

export default class Use implements Action {
  targetPreferences: ActionPreferences[] = [
    { insideOutsideType: "inside" },
    { position: "after", insideOutsideType: "outside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets0, targets1]: [
    TypedSelection[],
    TypedSelection[]
  ]): Promise<ActionReturnValue> {
    if (targets0.length === 1) {
      // If there is only one source target, expand it to same length as
      // destination target
      targets0 = Array(targets1.length).fill(targets0[0]);
    }

    await Promise.all([
      displayPendingEditDecorations(
        targets0,
        this.graph.editStyles.referenced,
        this.graph.editStyles.referencedLine
      ),
      displayPendingEditDecorations(
        targets1,
        this.graph.editStyles.pendingModification0,
        this.graph.editStyles.pendingLineModification0
      ),
    ]);

    const edits = zip(targets0, targets1).map(([target0, target1]) => {
      if (target0 == null || target1 == null) {
        throw new Error("Targets must have same number of args");
      }

      return {
        editor: target1.selection.editor,
        range: target1.selection.selection,
        newText: target0.selection.editor.document.getText(
          target0.selection.selection
        ),
        targetsIndex: 0,
        originalSelection: target1,
      };
    });

    const thatMark = flatten(
      await runForEachEditor(
        edits,
        (edit) => edit.editor,
        async (editor, edits) => {
          const newEdits = zip(edits, computeChangedOffsets(editor, edits)).map(
            ([originalEdit, changedEdit]) => ({
              targetsIndex: originalEdit!.targetsIndex,
              originalSelection: originalEdit!.originalSelection,
              originalRange: originalEdit!.range,
              newText: originalEdit!.newText,
              newStartOffset: changedEdit!.startOffset,
              newEndOffset: changedEdit!.endOffset,
            })
          );

          await editor.edit((editBuilder) => {
            newEdits.forEach((edit) => {
              if (edit.originalRange.isEmpty) {
                editBuilder.insert(edit.originalRange.start, edit.newText);
              } else {
                editBuilder.replace(edit.originalRange, edit.newText);
              }
            });
          });

          return newEdits.map((edit) => {
            const start = editor.document.positionAt(edit.newStartOffset);
            const end = editor.document.positionAt(edit.newEndOffset);

            const isReversed =
              edit.originalSelection.selection.selection.isReversed;

            const selection = new Selection(
              isReversed ? end : start,
              isReversed ? start : end
            );

            return {
              editor,
              targetsIndex: edit.targetsIndex,
              typedSelection: update(edit.originalSelection, {
                selection: {
                  selection: { $set: selection },
                },
              }),
              selection,
            };
          });
        }
      )
    );

    await Promise.all([
      displayPendingEditDecorations(
        thatMark
          .filter(({ targetsIndex }) => targetsIndex === 0)
          .map(({ typedSelection }) => typedSelection),
        this.graph.editStyles.pendingModification0,
        this.graph.editStyles.pendingLineModification0
      ),
      displayPendingEditDecorations(
        thatMark
          .filter(({ targetsIndex }) => targetsIndex === 1)
          .map(({ typedSelection }) => typedSelection),
        this.graph.editStyles.pendingModification1,
        this.graph.editStyles.pendingLineModification1
      ),
    ]);

    return { returnValue: null, thatMark };
  }
}
