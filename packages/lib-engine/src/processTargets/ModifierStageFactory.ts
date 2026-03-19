import type { Modifier } from "@cursorless/lib-common";
import type { ModifierStage } from "./PipelineStages.types";

export interface ModifierStageFactory {
  create(modifier: Modifier): ModifierStage;
}
