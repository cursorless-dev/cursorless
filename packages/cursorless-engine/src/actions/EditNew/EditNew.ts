import { RangeUpdater } from "../../core/updateSelections/RangeUpdater";
import { ModifierStageFactory } from "../../processTargets/ModifierStageFactory";
import { ModifierStage } from "../../processTargets/PipelineStages.types";
import { containingLineIfUntypedModifier } from "../../processTargets/modifiers/commonContainingScopeIfUntypedModifiers";
import { ide } from "../../singletons/ide.singleton";
import { Destination, Target } from "../../typings/target.types";
import { setSelectionsAndFocusEditor } from "../../util/setSelectionsAndFocusEditor";
import { createThatMark, ensureSingleEditor } from "../../util/targetUtils";
import { Actions } from "../Actions";
import {
  ActionRecord,
  ActionReturnValue,
  SimpleAction,
} from "../actions.types";
import { State } from "./EditNew.types";
import { runEditTargets } from "./runEditTargets";
import { runInsertLineAfterTargets } from "./runInsertLineAfterTargets";
import { runEditNewNotebookCellTargets } from "./runNotebookCellTargets";

export class EditNew {
  constructor(private rangeUpdater: RangeUpdater, private actions: Actions) {
    this.run = this.run.bind(this);
  }

  async run(destinations: Destination[]): Promise<ActionReturnValue> {
    if (destinations.some(({ target }) => target.isNotebookCell)) {
      // It is not possible to "pour" a notebook cell and something else,
      // because each notebook cell is its own editor, and you can't have
      // cursors in multiple editors.
      return runEditNewNotebookCellTargets(this.actions, destinations);
    }

    const editableEditor = ide().getEditableTextEditor(
      ensureSingleEditor(destinations),
    );

    /**
     * Keeps track of the desired cursor positions and "that" marks as we
     * perform the necessary commands and edits.
     */
    let state: State = {
      destinations,
      thatRanges: destinations.map(
        ({ target }) => target.thatTarget.contentRange,
      ),
      cursorRanges: new Array(destinations.length).fill(
        undefined,
      ) as undefined[],
    };

    state = await runInsertLineAfterTargets(
      this.rangeUpdater,
      editableEditor,
      state,
    );
    state = await runEditTargets(this.rangeUpdater, editableEditor, state);

    const newSelections = state.destinations.map((destination, index) =>
      state.cursorRanges[index]!.toSelection(destination.target.isReversed),
    );
    await setSelectionsAndFocusEditor(editableEditor, newSelections);

    return {
      thatSelections: createThatMark(
        state.destinations.map((d) => d.target),
        state.thatRanges,
      ),
    };
  }
}

abstract class EditNewLineAction implements SimpleAction {
  getFinalStages(): ModifierStage[] {
    return [this.modifierStageFactory.create(containingLineIfUntypedModifier)];
  }

  protected abstract insertionMode: "before" | "after";

  constructor(
    private actions: ActionRecord,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  run(targets: Target[]): Promise<ActionReturnValue> {
    return this.actions.editNew.run(
      targets.map((target) => target.toDestination(this.insertionMode)),
    );
  }
}

export class EditNewBefore extends EditNewLineAction {
  protected insertionMode = "before" as const;
}

export class EditNewAfter extends EditNewLineAction {
  protected insertionMode = "after" as const;
}
