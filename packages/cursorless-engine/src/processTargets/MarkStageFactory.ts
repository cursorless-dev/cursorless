import { Mark } from "@cursorless/common";
import { MarkStage } from "./PipelineStages.types";

export interface MarkStageFactory {
  create(mark: Mark): MarkStage;
}
