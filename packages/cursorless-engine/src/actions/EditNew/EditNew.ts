import { RangeUpdater } from "../../core/updateSelections/RangeUpdater";
import { containingLineIfUntypedModifier } from "../../processTargets/modifiers/commonContainingScopeIfUntypedModifiers";
import PositionStage from "../../processTargets/modifiers/PositionStage";
import { ModifierStageFactory } from "../../processTargets/ModifierStageFactory";
import { ModifierStage } from "../../processTargets/PipelineStages.types";
import { ide } from "../../singletons/ide.singleton";
import { Target } from "../../typings/target.types";
import { setSelectionsAndFocusEditor } from "../../util/setSelectionsAndFocusEditor";
import { createThatMark, ensureSingleEditor } from "../../util/targetUtils";
import { Actions } from "../Actions";
import { Action, ActionReturnValue } from "../actions.types";
import { State } from "./EditNew.types";
import { runEditTargets } from "./runEditTargets";
import { runInsertLineAfterTargets } from "./runInsertLineAfterTargets";
import { runEditNewNotebookCellTargets } from "./runNotebookCellTargets";

export class EditNew implements Action {
  getFinalStages(): ModifierStage[] {
    return [this.modifierStageFactory.create(containingLineIfUntypedModifier)];
  }

  constructor(
    private rangeUpdater: RangeUpdater,
    private actions: Actions,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    if (targets.some((target) => target.isNotebookCell)) {
      // It is not possible to "pour" a notebook cell and something else,
      // because each notebook cell is its own editor, and you can't have
      // cursors in multiple editors.
      return runEditNewNotebookCellTargets(this.actions, targets);
    }

    const editableEditor = ide().getEditableTextEditor(
      ensureSingleEditor(targets),
    );

    /**
     * Keeps track of the desired cursor positions and "that" marks as we
     * perform the necessary commands and edits.
     */
    let state: State = {
      targets,
      thatRanges: targets.map(({ thatTarget }) => thatTarget.contentRange),
      cursorRanges: new Array(targets.length).fill(undefined) as undefined[],
    };

    state = await runInsertLineAfterTargets(
      this.rangeUpdater,
      editableEditor,
      state,
    );
    state = await runEditTargets(this.rangeUpdater, editableEditor, state);

    const newSelections = state.targets.map((target, index) =>
      state.cursorRanges[index]!.toSelection(target.isReversed),
    );
    await setSelectionsAndFocusEditor(editableEditor, newSelections);

    return {
      thatSelections: createThatMark(state.targets, state.thatRanges),
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
