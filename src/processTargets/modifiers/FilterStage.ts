import type { Target } from "../../typings/target.types";
import type {
  ContentModifier,
  EmptyModifier,
  WhitespaceModifier,
} from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { ModifierStage } from "../PipelineStages.types";

export class ContentFilterStage implements ModifierStage {
  constructor(private modifier: ContentModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return target.contentText.trim() !== "" ? [target] : [];
  }
}

export class EmptyFilterStage implements ModifierStage {
  constructor(private modifier: EmptyModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return target.contentRange.isEmpty ? [target] : [];
  }
}

export class WhitespaceFilterStage implements ModifierStage {
  constructor(private modifier: WhitespaceModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return !target.contentRange.isEmpty && target.contentText.trim() === ""
      ? [target]
      : [];
  }
}
