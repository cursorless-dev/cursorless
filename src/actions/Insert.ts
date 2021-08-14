import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TextGenerator,
  TypedSelection,
} from "../typings/Types";
import { displayPendingEditDecorationsForSelection } from "../util/editDisplayUtils";
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

  async run(
    [targets]: [TypedSelection[]],
    generator: TextGenerator
  ): Promise<ActionReturnValue> {
    const texts = generateText(generator, targets.length);

    const edits = zip(targets, texts).map(([target, text]) => ({
      editor: target!.selection.editor,
      range: target!.selection.selection,
      text: maybeAddDelimiter(text!, target!),
      extendOnEqualEmptyRange: true,
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

    await displayPendingEditDecorationsForSelection(
      thatMark,
      this.graph.editStyles.justAdded.token
    );

    return { thatMark };
  }
}
