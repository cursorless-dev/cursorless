import { Range } from "@cursorless/common";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { containingLineIfUntypedStage } from "../processTargets/modifiers/commonContainingScopeIfUntypedStages";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class ToggleBreakpoint implements Action {
  getFinalStages = () => [containingLineIfUntypedStage];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[], Target[]]): Promise<ActionReturnValue> {
    const thatTargets = targets.map(({ thatTarget }) => thatTarget);

    await this.graph.editStyles.displayPendingEditDecorations(
      thatTargets,
      this.graph.editStyles.referenced,
    );

    await runOnTargetsForEachEditor(targets, async (editor, targets) => {
      const ranges = targets.map((target) => {
        const range = target.contentRange;
        // The action preference give us line content but line breakpoints are registered on character 0
        if (target.isLine) {
          return new Range(range.start.line, 0, range.end.line, 0);
        }
        return range;
      });

      await ide().getEditableTextEditor(editor).toggleBreakpoint(ranges);
    });

    return {
      thatTargets: targets,
    };
  }
}
