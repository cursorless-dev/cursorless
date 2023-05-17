import { Modifier, ModifyIfUntypedModifier } from "@cursorless/common";
import { ProcessedTargetsContext } from "../../typings/Types";
import { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import { ModifierStage } from "../PipelineStages.types";

abstract class ConditionalModifierBaseStage implements ModifierStage {
  private nestedStage_?: ModifierStage;
  protected suppressErrors = false;

  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private nestedModifier: Modifier,
  ) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    if (this.shouldModify(target)) {
      // Modify this target
      try {
        return this.nestedStage
          .run(context, target)
          .map((newTarget) => newTarget.withThatTarget(target));
      } catch (ex) {
        // suppressErrors === true => Allow this target to be returned unmodified
        if (!this.suppressErrors) {
          throw ex;
        }
      }
    }

    // Don't modify this target
    return [target];
  }

  private get nestedStage() {
    if (this.nestedStage_ == null) {
      this.nestedStage_ = this.modifierStageFactory.create(this.nestedModifier);
    }

    return this.nestedStage_;
  }

  protected abstract shouldModify(target: Target): boolean;
}

/**
 * Runs {@link ModifyIfUntypedModifier.modifier} if the target has no explicit
 * scope type, ie if {@link Target.hasExplicitScopeType} is `false`.
 */
export class ModifyIfUntypedStage extends ConditionalModifierBaseStage {
  constructor(
    modifierStageFactory: ModifierStageFactory,
    modifier: ModifyIfUntypedModifier,
  ) {
    super(modifierStageFactory, modifier.modifier);
  }

  protected shouldModify(target: Target): boolean {
    return !target.hasExplicitScopeType;
  }
}

/**
 * Runs {@link nestedModifier} if
 * - the target has no explicit scope type, ie if
 *   {@link Target.hasExplicitScopeType} is `false`, and
 * - the target is not implicit, ie if {@link Target.isImplicit} is `false`.
 */
export class ModifyIfUntypedExplicitStage extends ConditionalModifierBaseStage {
  protected shouldModify(target: Target): boolean {
    return !target.hasExplicitScopeType && !target.isImplicit;
  }
}

/**
 * Tries to convert target into token if: {@link Target.hasExplicitScopeType} is
 * `false` and {@link Target.hasExplicitRange} is `false` and
 * {@link Target.contentRange.isEmpty} is `true`.
 *
 * Designed to be used for eg auto-expansion to containing token when user says
 * "take this" with empty selection.
 */
export class ContainingTokenIfUntypedEmptyStage extends ConditionalModifierBaseStage {
  suppressErrors = true;

  constructor(modifierStageFactory: ModifierStageFactory) {
    super(modifierStageFactory, {
      type: "containingScope",
      scopeType: { type: "token" },
    });
  }

  protected shouldModify(target: Target): boolean {
    return (
      !target.hasExplicitScopeType &&
      !target.hasExplicitRange &&
      target.contentRange.isEmpty
    );
  }
}
