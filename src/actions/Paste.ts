import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import displayPendingEditDecorations from "../editDisplayUtils";
import { env, Selection } from "vscode";
import { runForEachEditor } from "../targetUtils";
import { computeChangedOffsets } from "../computeChangedOffsets";
import { flatten, zip } from "lodash";
import update from "immutability-helper";

export default class Paste implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.pendingModification0,
      this.graph.editStyles.pendingLineModification0
    );

    const text = await env.clipboard.readText();

    if (text.length === 0) {
      throw new Error("Can't paste empty clipboard");
    }

    const lines = text.trim().split("\n");

    const getText =
      targets.length === lines.length
        ? // Paste each line on each target
          (index: number) => lines[index]
        : // Paste entire clipboard on each target
          () => text;

    const edits = targets.map((target, index) => ({
      editor: target.selection.editor,
      range: target.selection.selection,
      originalSelection: target,
      text: getText(index),
    }));

    const thatMark = flatten(
      await runForEachEditor(
        edits,
        (edit) => edit.editor,
        async (editor, edits) => {
          const newEdits = zip(edits, computeChangedOffsets(editor, edits)).map(
            ([originalEdit, changedEdit]) => ({
              originalRange: originalEdit!.range,
              originalSelection: originalEdit!.originalSelection,
              text: originalEdit!.text,
              newStartOffset: changedEdit!.startOffset,
              newEndOffset: changedEdit!.endOffset,
            })
          );

          await editor.edit((editBuilder) => {
            newEdits.forEach((edit) => {
              if (edit.originalRange.isEmpty) {
                editBuilder.insert(edit.originalRange.start, edit.text);
              } else {
                editBuilder.replace(edit.originalRange, edit.text);
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

    await displayPendingEditDecorations(
      thatMark.map(({ typedSelection }) => typedSelection),
      this.graph.editStyles.pendingModification0,
      this.graph.editStyles.pendingLineModification0
    );

    return { returnValue: null, thatMark };
  }
}
