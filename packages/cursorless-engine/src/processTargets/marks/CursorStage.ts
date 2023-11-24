import type { CursorMark } from "@cursorless/common";
import { ide } from "../../singletons/ide.singleton";
import type { Target } from "../../typings/target.types";
import type { MarkStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";
import { getActiveSelections } from "./getActiveSelections";

export class CursorStage implements MarkStage {
  constructor(private mark: CursorMark) {}

  run(): Target[] {
    return getActiveSelections(ide()).map(
      (selection) =>
        new UntypedTarget({
          editor: selection.editor,
          isReversed: selection.selection.isReversed,
          contentRange: selection.selection,
          hasExplicitRange: !selection.selection.isEmpty,
          isToken: false,
          avoidImplicitExpansion: this.mark.avoidImplicitExpansion,
        }),
    );
  }
}
