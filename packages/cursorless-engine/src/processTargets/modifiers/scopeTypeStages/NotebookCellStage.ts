import type { Target } from "../../../typings/target.types";
import type {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "@cursorless/common";
import type { ModifierStage } from "../../PipelineStages.types";
import { NotebookCellTarget } from "../../targets";

export class NotebookCellStage implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(target: Target): NotebookCellTarget[] {
    if (this.modifier.type === "everyScope") {
      throw new Error(`Every ${this.modifier.type} not yet implemented`);
    }

    return [
      new NotebookCellTarget({
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange: target.contentRange,
      }),
    ];
  }
}
