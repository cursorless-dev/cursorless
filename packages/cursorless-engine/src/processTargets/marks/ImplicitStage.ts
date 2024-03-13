import { ide } from "../../singletons/ide.singleton";
import type { Target } from "../../typings/target.types";
import type { MarkStage } from "../PipelineStages.types";
import { ImplicitTarget } from "../targets";
import { getActiveSelections } from "./getActiveSelections";

export class ImplicitStage implements MarkStage {
  async run(): Promise<Target[]> {
    return getActiveSelections(ide()).map(
      (selection) =>
        new ImplicitTarget({
          editor: selection.editor,
          isReversed: selection.selection.isReversed,
          contentRange: selection.selection,
        }),
    );
  }
}
