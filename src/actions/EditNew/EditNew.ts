import { weakContainingLineStage } from "../../processTargets/modifiers/commonWeakContainingScopeStages";
import PositionStage from "../../processTargets/modifiers/PositionStage";
import { ModifierStage } from "../../processTargets/PipelineStages.types";
import { EditOptions } from "../../typings/edit.types";
import { Target } from "../../typings/target.types";
import { Graph } from "../../typings/Types";
import { selectionFromRange } from "../../util/selectionUtils";
import { setSelectionsAndFocusEditor } from "../../util/setSelectionsAndFocusEditor";
import { createThatMark, ensureSingleEditor } from "../../util/targetUtils";
import { Action, ActionReturnValue } from "../actions.types";
import { State } from "./EditNew.types";
import { runNotebookCellTargets } from "./runNotebookCellTargets";
import { runCommandTargets } from "./runCommandTargets";
import { runEditTargets } from "./runEditTargets";

export class EditNew implements Action {
  getFinalStages(): ModifierStage[] {
    return [weakContainingLineStage];
  }

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    editOptions?: EditOptions
  ): Promise<ActionReturnValue> {
    if (targets.some((target) => target.isNotebookCell)) {
      return runNotebookCellTargets(this.graph, targets);
    }

    const editor = ensureSingleEditor(targets);

    let state: State = {
      targets,
      thatRanges: targets.map(({ thatTarget }) => thatTarget.contentRange),
      cursorRanges: new Array(targets.length).fill(undefined) as undefined[],
    };

    state = await runCommandTargets(this.graph, editor, state);
    state = await runEditTargets(this.graph, editor, state, editOptions);

    const newSelections = state.targets.map((target, index) =>
      selectionFromRange(target.isReversed, state.cursorRanges[index]!)
    );
    await setSelectionsAndFocusEditor(editor, newSelections);

    return {
      thatMark: createThatMark(state.targets, state.thatRanges),
    };
  }
}

export class EditNewBefore extends EditNew {
  getFinalStages() {
    return [
      ...super.getFinalStages(),
      new PositionStage({
        type: "position",
        position: "before",
      }),
    ];
  }
}

export class EditNewAfter extends EditNew {
  getFinalStages() {
    return [
      ...super.getFinalStages(),
      new PositionStage({
        type: "position",
        position: "after",
      }),
    ];
  }
}
