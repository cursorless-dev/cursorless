import { Target } from "../../typings/target.types";
import { SourceMark, ThatMark } from "@cursorless/common";
import { ProcessedTargetsContext } from "../../typings/Types";
import { MarkStage } from "../PipelineStages.types";

export class ThatStage implements MarkStage {
  constructor(private mark: ThatMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    if (context.thatMark.length === 0) {
      throw Error("No available that marks");
    }

    return context.thatMark;
  }
}

export class SourceStage implements MarkStage {
  constructor(private mark: SourceMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    if (context.sourceMark.length === 0) {
      throw Error("No available source marks");
    }

    return context.sourceMark;
  }
}
