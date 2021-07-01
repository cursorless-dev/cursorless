import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import displayPendingEditDecorations from "../editDisplayUtils";
import { TextEditorRevealType } from "vscode";

class Scroll implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];
  revealType: TextEditorRevealType = TextEditorRevealType.Default;

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.referenced,
      this.graph.editStyles.referencedLine
    );

    const target = targets[0];
    target.selection.editor.revealRange(
      target.selection.selection,
      this.revealType
    );

    return {
      returnValue: null,
      thatMark: targets.map((target) => target.selection)
    };
  }
}

export class ScrollTopView extends Scroll {
  constructor(graph: Graph) {
    super(graph);
    this.revealType = TextEditorRevealType.AtTop;
  }
}

export class ScrollCenterView extends Scroll {
  constructor(graph: Graph) {
    super(graph);
    this.revealType = TextEditorRevealType.InCenter;
  }
}