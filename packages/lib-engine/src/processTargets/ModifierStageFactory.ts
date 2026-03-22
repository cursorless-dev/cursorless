import type { Modifier } from "@cursorless/lib-common";
import type { ModifierStage } from "./PipelineStages.types";
import type { ComplexModifier } from "./modifiers/modifier.types";

export interface ModifierStageFactory {
  create(modifier: Modifier | ComplexModifier): ModifierStage;
}
