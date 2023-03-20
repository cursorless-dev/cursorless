import type { Target } from "../../typings/target.types";
import type { CursorMark } from "@cursorless/common";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { MarkStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";

export default class CursorStage implements MarkStage {
  constructor(private mark: CursorMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    return context.currentSelections.map(
      (selection) =>
        new UntypedTarget({
          editor: selection.editor,
          isReversed: selection.selection.isReversed,
          contentRange: selection.selection,
          hasExplicitRange: !selection.selection.isEmpty,
        }),
    );
  }
}
