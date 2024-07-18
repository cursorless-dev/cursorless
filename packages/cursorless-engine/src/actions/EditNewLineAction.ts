import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { ModifierStage } from "../processTargets/PipelineStages.types";
import { containingLineIfUntypedModifier } from "../processTargets/modifiers/commonContainingScopeIfUntypedModifiers";
import { Target } from "../typings/target.types";
import { ActionRecord, ActionReturnValue, SimpleAction } from "./actions.types";

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
