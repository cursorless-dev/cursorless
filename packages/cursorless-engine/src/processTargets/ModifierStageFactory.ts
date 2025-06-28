import type { Modifier } from "@cursorless/common";
import type { ModifierStage } from "./PipelineStages.types";

export interface ModifierStageFactory {
  create(modifier: Modifier): ModifierStage;
}
