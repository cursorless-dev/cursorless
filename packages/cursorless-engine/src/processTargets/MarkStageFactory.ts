import type { Mark } from "../typings/TargetDescriptor";
import type { MarkStage } from "./PipelineStages.types";

export interface MarkStageFactory {
  create(mark: Mark): MarkStage;
}
