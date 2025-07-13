import type {
  ContainingScopeModifier,
  EveryScopeModifier,
  OrdinalScopeModifier,
  PreferredScopeModifier,
  RelativeScopeModifier,
  ScopeType,
} from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type {
  ModifierStage,
  ModifierStateOptions,
} from "../PipelineStages.types";

/**
 * Replace `className` scope with `name` and `class`.
 * Replace `functionName` scope with `name` and `namedFunction`.
 */
export class ClassFunctionNameStage implements ModifierStage {
  private nestedStages_?: ModifierStage[];

  static use(scopeType: ScopeType): boolean {
    return scopeType.type === "className" || scopeType.type === "functionName";
  }

  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier:
      | ContainingScopeModifier
      | PreferredScopeModifier
      | EveryScopeModifier
      | OrdinalScopeModifier
      | RelativeScopeModifier,
  ) {}

  run(target: Target, options: ModifierStateOptions): Target[] {
    const stage1 = this.modifierStageFactory.create({
      ...this.modifier,
      scopeType: {
        type: getScopeTypeType(this.modifier.scopeType),
      },
    });

    const stage2 = this.modifierStageFactory.create({
      type: "containingScope",
      scopeType: {
        type: "name",
      },
    });

    return stage1.run(target, options).flatMap((t) => stage2.run(t, options));
  }
}

function getScopeTypeType(scopeType: ScopeType) {
  if (scopeType.type === "className") {
    return "class";
  }
  if (scopeType.type === "functionName") {
    return "namedFunction";
  }
  throw new Error(`Unsupported scope type: ${scopeType.type}`);
}
