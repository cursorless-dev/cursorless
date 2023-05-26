import { Mark } from "../typings/TargetDescriptor";
import { MarkStage } from "./PipelineStages.types";

export interface MarkStageFactory {
  create(mark: Mark): MarkStage;
}
