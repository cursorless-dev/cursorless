import { flatten, zip } from "lodash";
import { DecorationRangeBehavior, Selection, TextEditor } from "vscode";
import { performEditsAndUpdateSelectionsWithBehavior } from "../core/updateSelections/updateSelections";
import { weakContainingLineStage } from "../processTargets/modifiers/commonWeakContainingScopeStages";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";
import { createThatMark, runOnTargetsForEachEditor } from "../util/targetUtils";
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
    // isBefore is inverted because we want the selections to stay with what is to the user the "copy"
    const position = this.isBefore ? "after" : "before";
    const edits = targets.flatMap((target) =>
      target.toPositionTarget(position).constructChangeEdit(target.contentText)
    );

    const cursorSelections = { selections: editor.selections };
    const contentSelections = {
      selections: targets.map(({ contentSelection }) => contentSelection),
    };
    const editSelections = {
      selections: edits.map(
        ({ range }) => new Selection(range.start, range.end)
      ),
      rangeBehavior: DecorationRangeBehavior.OpenOpen,
    };

    const [
      updatedEditorSelections,
      updatedContentSelections,
      updatedEditSelections,
    ]: Selection[][] = await performEditsAndUpdateSelectionsWithBehavior(
      this.graph.rangeUpdater,
      editor,
      edits,
      [cursorSelections, contentSelections, editSelections]
    );

    const insertionRanges = zip(edits, updatedEditSelections).map(
      ([edit, selection]) => edit!.updateRange(selection!)
    );

    setSelectionsWithoutFocusingEditor(editor, updatedEditorSelections);
    editor.revealRange(editor.selection);

    return {
      sourceMark: createThatMark(targets, insertionRanges),
      thatMark: createThatMark(targets, updatedContentSelections),
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
