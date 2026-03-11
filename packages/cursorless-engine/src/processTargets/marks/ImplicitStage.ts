import type { IDE } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { MarkStage } from "../PipelineStages.types";
import { ImplicitTarget } from "../targets";
import { getActiveSelections } from "./getActiveSelections";

export class ImplicitStage implements MarkStage {
  constructor(private ide: IDE) {}

  run(): Target[] {
    return getActiveSelections(this.ide).map(
      (selection) =>
        new ImplicitTarget({
          editor: selection.editor,
          isReversed: selection.selection.isReversed,
          contentRange: selection.selection,
        }),
    );
  }
}
