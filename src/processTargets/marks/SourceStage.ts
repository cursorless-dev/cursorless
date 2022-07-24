import { Target } from "../../typings/target.types";
import { SourceMark } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { MarkStage } from "../PipelineStages.types";
import { cursorSelectionsToTarget } from "./CursorStage";

export default class implements MarkStage {
  constructor(private modifier: SourceMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    if (context.sourceMark.length === 0) {
      throw Error("No available source marks");
    }
    return cursorSelectionsToTarget(context.sourceMark);
  }
}
