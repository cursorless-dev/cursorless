import * as vscode from "vscode";
import { Position } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import PipelineStage from "./PipelineStage";

export default class implements PipelineStage {
  run(
    context: ProcessedTargetsContext,
    stage: Position,
    selection: TypedSelection
  ): TypedSelection {
    const res: TypedSelection = {
      ...selection,
    };
    switch (stage.position) {
      case "before":
      case "start":
        res.contentRange = range(res.contentRange.start)!;
        res.interiorRange = range(res.interiorRange?.start);
        break;
      case "after":
      case "end":
        res.contentRange = range(res.contentRange.end)!;
        res.interiorRange = range(res.interiorRange?.end);
        break;
    }
    return res;
  }
}

function range(position?: vscode.Position) {
  return position ? new vscode.Range(position, position) : undefined;
}
