import type { Modifier } from "@cursorless/lib-common";
import type { ComplexModifier } from "./modifiers/modifier.types";
import type { ModifierStage } from "./PipelineStages.types";

export interface ModifierStageFactory {
  create(modifier: Modifier | ComplexModifier): ModifierStage;
}
