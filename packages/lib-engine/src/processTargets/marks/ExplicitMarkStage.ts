import type { ExplicitMark, IDE } from "@cursorless/common";
import { Range } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { MarkStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";

export class ExplicitMarkStage implements MarkStage {
  constructor(
    private ide: IDE,
    private mark: ExplicitMark,
  ) {}

  run(): Target[] {
    const {
      editorId,
      range: { start, end },
    } = this.mark;

    const editor = this.ide.visibleTextEditors.find((e) => e.id === editorId);

    if (editor == null) {
      throw new Error(`Couldn't find editor '${editorId}'`);
    }

    const contentRange = new Range(
      start.line,
      start.character,
      end.line,
      end.character,
    );

    return [
      new UntypedTarget({
        editor,
        contentRange,
        isReversed: false,
        hasExplicitRange: false,
      }),
    ];
  }
}
