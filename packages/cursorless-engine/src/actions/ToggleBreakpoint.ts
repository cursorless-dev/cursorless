import { ide } from "../singletons/ide.singleton";
import { containingLineIfUntypedStage } from "../processTargets/modifiers/commonContainingScopeIfUntypedStages";
import { Target } from "../typings/target.types";
import { flashTargets, runOnTargetsForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";
import { BreakpointDescriptor, FlashStyle } from "@cursorless/common";

export default class ToggleBreakpoint implements Action {
  getFinalStages = () => [containingLineIfUntypedStage];

  constructor() {
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
