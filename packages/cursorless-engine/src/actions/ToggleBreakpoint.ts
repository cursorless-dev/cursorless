import { FlashStyle, type IDE } from "@cursorless/common";
import type { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { containingLineIfUntypedModifier } from "../processTargets/modifiers/commonContainingScopeIfUntypedModifiers";
import type { Target } from "../typings/target.types";
import {
  flashTargets,
  runOnTargetsForEachEditor,
  toGeneralizedRange,
} from "../util/targetUtils";
import type { ActionReturnValue, SimpleAction } from "./actions.types";

export default class ToggleBreakpoint implements SimpleAction {
  getFinalStages = () => [
    this.modifierStageFactory.create(containingLineIfUntypedModifier),
  ];

  constructor(
    private ide: IDE,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    const thatTargets = targets.map(({ thatTarget }) => thatTarget);

    await flashTargets(this.ide, thatTargets, FlashStyle.referenced);

    await runOnTargetsForEachEditor(targets, async (editor, targets) => {
      const generalizedRanges = targets.map((target) =>
        toGeneralizedRange(target, target.contentRange),
      );

      await this.ide
        .getEditableTextEditor(editor)
        .toggleBreakpoint(generalizedRanges);
    });

    return {
      thatTargets: targets,
    };
  }
}
