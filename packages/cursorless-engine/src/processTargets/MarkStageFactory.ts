import { Mark } from "../typings/TargetDescriptor";
import { MarkStage } from "./PipelineStages.types";

export interface MarkStageFactoryOpts {
  /** If there is an `instance` modifier downstream in the pipeline */
  isForInstance: boolean;
}

export interface MarkStageFactory {
  create(mark: Mark, opts: MarkStageFactoryOpts): MarkStage;
}
