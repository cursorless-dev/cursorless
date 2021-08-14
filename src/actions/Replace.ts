import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TextGenerator,
  TypedSelection,
} from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { runForEachEditor } from "../util/targetUtils";
import { flatten, zip } from "lodash";
import { maybeAddDelimiter } from "../util/getTextWithPossibleDelimiter";
import { performEditsAndUpdateSelections } from "../util/updateSelections";
import generateText from "../generateText";

export default class implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: null }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  private getTexts(
    targets: TypedSelection[],
    replaceWith: string[] | TextGenerator
  ): string[] {
    if (Array.isArray(replaceWith)) {
      // Broadcast single text to each target
      if (replaceWith.length === 1) {
        return Array(targets.length).fill(replaceWith[0]);
      }
      return replaceWith;
    }
    return generateText(replaceWith, targets.length);
  }

  async run(
    [targets]: [TypedSelection[]],
    replaceWith: string[] | TextGenerator
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

    return { thatMark };
  }
}
