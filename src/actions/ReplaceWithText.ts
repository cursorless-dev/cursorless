import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import displayPendingEditDecorations from "../editDisplayUtils";
import { runForEachEditor } from "../targetUtils";
import { flatten, zip } from "lodash";
import { maybeAddDelimiter } from "../getTextWithPossibleDelimiter";
import { performEditsAndUpdateSelections } from "../updateSelections";

export default class implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: null }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [TypedSelection[]],
    texts: string[]
  ): Promise<ActionReturnValue> {
    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.pendingModification0
    );

    // Broadcast single text for each target
    if (texts.length === 1) {
      texts = Array(targets.length).fill(texts[0]);
    }

    if (targets.length !== texts.length) {
      throw new Error("Targets and texts must have same length");
    }

    const edits = zip(targets, texts).map(([target, text]) => ({
      editor: target!.selection.editor,
      range: target!.selection.selection,
      text: maybeAddDelimiter(text!, target!),
    }));

    const thatMark = flatten(
      await runForEachEditor(
        edits,
        (edit) => edit.editor,
        async (editor, edits) => {
          const [updatedSelections] = await performEditsAndUpdateSelections(
            editor,
            edits,
            [targets.map((target) => target.selection.selection)]
          );

          return updatedSelections.map((selection) => ({
            editor,
            selection,
          }));
        }
      )
    );

    return { returnValue: null, thatMark };
  }
}
