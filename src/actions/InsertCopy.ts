import { flatten } from "lodash";
import { TextEditor } from "vscode";
import { weakContainingLineStage } from "../processTargets/modifiers/commonWeakContainingScopeStages";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";
import { createThatMark, runOnTargetsForEachEditor } from "../util/targetUtils";
import { insertTextAfter, insertTextBefore } from "../util/textInsertion";
import { Action, ActionReturnValue } from "./actions.types";

class InsertCopy implements Action {
  getFinalStages = () => [weakContainingLineStage];

  constructor(private graph: Graph, private isBefore: boolean) {
    this.run = this.run.bind(this);
    this.runForEditor = this.runForEditor.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const results = flatten(
      await runOnTargetsForEachEditor(targets, this.runForEditor)
    );

    await this.graph.editStyles.displayPendingEditDecorationsForRanges(
      results.flatMap((result) =>
        result.thatMark.map((that) => ({
          editor: that.editor,
          range: that.selection,
        }))
      ),
      this.graph.editStyles.justAdded,
      true
    );

    return {
      sourceMark: results.flatMap(({ sourceMark }) => sourceMark),
      thatMark: results.flatMap(({ thatMark }) => thatMark),
    };
  }

  private async runForEditor(editor: TextEditor, targets: Target[]) {
    const textInsertions = targets.map((target) => {
      return {
        range: target.contentRange,
        text: target.contentText,
        delimiter: target.delimiter ?? "",
      };
    });

    const { updatedEditorSelections, updatedContentRanges, insertionRanges } =
      // isBefore is inverted because we want the selections to stay with what is to the user the "copy"
      this.isBefore
        ? await insertTextAfter(this.graph, editor, textInsertions)
        : await insertTextBefore(this.graph, editor, textInsertions);

    setSelectionsWithoutFocusingEditor(editor, updatedEditorSelections);
    editor.revealRange(editor.selection);

    return {
      sourceMark: createThatMark(targets, insertionRanges),
      thatMark: createThatMark(targets, updatedContentRanges),
    };
  }
}

export class CopyContentBefore extends InsertCopy {
  constructor(graph: Graph) {
    super(graph, true);
  }
}

export class CopyContentAfter extends InsertCopy {
  constructor(graph: Graph) {
    super(graph, false);
  }
}
