import { RangeUpdater } from "../../core/updateSelections/RangeUpdater";
import { containingLineIfUntypedModifier } from "../../processTargets/modifiers/commonContainingScopeIfUntypedModifiers";
import { ModifierStageFactory } from "../../processTargets/ModifierStageFactory";
import { ModifierStage } from "../../processTargets/PipelineStages.types";
import { ide } from "../../singletons/ide.singleton";
import { Destination, Target } from "../../typings/target.types";
import { setSelectionsAndFocusEditor } from "../../util/setSelectionsAndFocusEditor";
import { createThatMark, ensureSingleEditor } from "../../util/targetUtils";
import { Actions } from "../Actions";
import { SimpleAction, ActionReturnValue } from "../actions.types";
import { State } from "./EditNew.types";
import { runEditTargets } from "./runEditTargets";
import { runInsertLineAfterTargets } from "./runInsertLineAfterTargets";
import { runEditNewNotebookCellTargets } from "./runNotebookCellTargets";

export class EditNew implements SimpleAction {
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

  async run(targets: Target[]): Promise<ActionReturnValue> {
    return this.runDestinations(
      targets.map((target) => this.toDestination(target)),
    );
  }

  async runDestinations(
    destinations: Destination[],
  ): Promise<ActionReturnValue> {
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

  protected toDestination(target: Target): Destination {
    return target.toDestination("to");
  }
}

export class EditNewBefore extends EditNew {
  protected toDestination(target: Target): Destination {
    return target.toDestination("before");
  }
}

export class EditNewAfter extends EditNew {
  protected toDestination(target: Target): Destination {
    return target.toDestination("after");
  }
}
