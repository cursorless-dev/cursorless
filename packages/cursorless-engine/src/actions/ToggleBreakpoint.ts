import { BreakpointDescriptor, FlashStyle } from "@cursorless/common";
import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { containingLineIfUntypedModifier } from "../processTargets/modifiers/commonContainingScopeIfUntypedModifiers";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { flashTargets, runOnTargetsForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class ToggleBreakpoint implements Action {
  getFinalStages = () => [
    this.modifierStageFactory.create(containingLineIfUntypedModifier),
  ];

  constructor(private modifierStageFactory: ModifierStageFactory) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[], Target[]]): Promise<ActionReturnValue> {
    const thatTargets = targets.map(({ thatTarget }) => thatTarget);

    await flashTargets(ide(), thatTargets, FlashStyle.referenced);

    await runOnTargetsForEachEditor(targets, async (editor, targets) => {
      const breakpointDescriptors: BreakpointDescriptor[] = targets.map(
        (target) => {
          const range = target.contentRange;
          return target.isLine
            ? {
                type: "line",
                startLine: range.start.line,
                endLine: range.end.line,
              }
            : {
                type: "inline",
                range,
              };
        },
      );

      await ide()
        .getEditableTextEditor(editor)
        .toggleBreakpoint(breakpointDescriptors);
    });

    return {
      thatTargets: targets,
    };
  }
}
