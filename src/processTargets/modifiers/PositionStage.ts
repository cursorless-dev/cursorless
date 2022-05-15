import * as vscode from "vscode";
import { PositionModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(context: ProcessedTargetsContext, selection: Target): Target {
    const res: Target = {
      ...selection,
      leadingDelimiterRange: undefined,
      trailingDelimiterRange: undefined,
    };
    switch (this.modifier.position) {
      case "before":
      case "start":
        res.contentRange = range(res.contentRange.start)!;
        res.interiorRange = range(res.interiorRange?.start);
        res.removalRange = range(res.removalRange?.start);
        break;
      case "after":
      case "end":
        res.contentRange = range(res.contentRange.end)!;
        res.interiorRange = range(res.interiorRange?.end);
        res.removalRange = range(res.removalRange?.end);
        break;
    }
    return res;
  }
}

function range(position?: vscode.Position) {
  return position ? new vscode.Range(position, position) : undefined;
}
