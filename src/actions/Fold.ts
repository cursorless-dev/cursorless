import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { createThatMark, ensureSingleEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

class FoldAction implements Action {
  constructor(private isFold: boolean) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[], Target[]]): Promise<ActionReturnValue> {
    const editor = ide().getEditableTextEditor(ensureSingleEditor(targets));

    const singleLineTargets = targets.filter(
      (target) => target.contentRange.isSingleLine,
    );
    const multiLineTargets = targets.filter(
      (target) => !target.contentRange.isSingleLine,
    );

    // Don't mix multi and single line targets.
    // This is probably the result of an "every" command
    // and folding the single line targets will fold the parent as well
    const selectedTargets = multiLineTargets.length
      ? multiLineTargets
      : singleLineTargets;

    const selectionLines = selectedTargets.map(
      (target) => target.contentRange.start.line,
    );

    if (this.isFold) {
      await editor.fold(selectionLines);
    } else {
      await editor.unfold(selectionLines);
    }

    return {
      thatSelections: createThatMark(targets),
    };
  }
}

export class Fold extends FoldAction {
  constructor(_graph: Graph) {
    super(true);
  }
}

export class Unfold extends FoldAction {
  constructor(_graph: Graph) {
    super(false);
  }
}
