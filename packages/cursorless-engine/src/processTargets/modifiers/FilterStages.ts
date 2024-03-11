import type { Target } from "../../typings/target.types";
import type {
  KeepContentFilterModifier,
  KeepEmptyFilterModifier,
} from "@cursorless/common";
import type { ModifierStage } from "../PipelineStages.types";

export class KeepContentFilterStage implements ModifierStage {
  constructor(private modifier: KeepContentFilterModifier) {}

  async run(target: Target): Promise<Target[]> {
    return (await target.contentText).trim() !== "" ? [target] : [];
  }
}

export class KeepEmptyFilterStage implements ModifierStage {
  constructor(private modifier: KeepEmptyFilterModifier) {}

  async run(target: Target): Promise<Target[]> {
    return (await target.contentText).trim() === "" ? [target] : [];
  }
}
