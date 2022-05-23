import { flatten, zip } from "lodash";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { runForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

type RangeGenerator = { start: number };

export default class implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  private getTexts(
    targets: Target[],
    replaceWith: string[] | RangeGenerator
  ): string[] {
    if (Array.isArray(replaceWith)) {
      // Broadcast single text to each target
      if (replaceWith.length === 1) {
        return Array(targets.length).fill(replaceWith[0]);
      }
      return replaceWith;
    }
    const numbers = [];
    for (let i = 0; i < targets.length; ++i) {
      numbers[i] = (replaceWith.start + i).toString();
    }
    return numbers;
  }

  async run(
    [targets]: [Target[]],
    replaceWith: string[] | RangeGenerator
  ): Promise<ActionReturnValue> {
    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.pendingModification0
    );

    const texts = this.getTexts(targets, replaceWith);

    if (targets.length !== texts.length) {
      throw new Error("Targets and texts must have same length");
    }

    const edits = zip(targets, texts).map(([target, text]) => ({
      editor: target!.editor,
      range: target!.contentRange,
      text: target!.maybeAddDelimiter(text!),
    }));

    const thatMark = flatten(
      await runForEachEditor(
        edits,
        (edit) => edit.editor,
        async (editor, edits) => {
          const [updatedSelections] = await performEditsAndUpdateSelections(
            this.graph.rangeUpdater,
            editor,
            edits,
            [targets.map((target) => target.contentSelection)]
          );

          return updatedSelections.map((selection) => ({
            editor,
            selection,
          }));
        }
      )
    );

    return { thatMark };
  }
}
