import { Target } from "../../typings/target.types";
import { ThatMark } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { MarkStage } from "../PipelineStages.types";
import { cursorSelectionsToTarget } from "./CursorStage";

export default class implements MarkStage {
  constructor(private modifier: ThatMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    if (context.thatMark.length === 0) {
      throw Error("No available that marks");
    }
    return cursorSelectionsToTarget(context.thatMark);
  }
}
