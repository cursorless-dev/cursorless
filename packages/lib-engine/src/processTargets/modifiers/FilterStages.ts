import type {
  KeepContentFilterModifier,
  KeepEmptyFilterModifier,
} from "@cursorless/lib-common";
import type { Target } from "../../typings/target.types";
import type { ModifierStage } from "../PipelineStages.types";

export class KeepContentFilterStage implements ModifierStage {
  constructor(private modifier: KeepContentFilterModifier) {}

  run(target: Target): Target[] {
    return target.contentText.trim() !== "" ? [target] : [];
  }
}

export class KeepEmptyFilterStage implements ModifierStage {
  constructor(private modifier: KeepEmptyFilterModifier) {}

  run(target: Target): Target[] {
    return target.contentText.trim() === "" ? [target] : [];
  }
}
