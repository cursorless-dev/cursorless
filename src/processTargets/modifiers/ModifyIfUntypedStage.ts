import { Target } from "../../typings/target.types";
import {
  Modifier,
  ModifyIfUntypedModifier,
} from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";
import { ModifierStage } from "../PipelineStages.types";

abstract class ModifyIfBaseStage implements ModifierStage {
  private nestedStage_?: ModifierStage;

  constructor(private modifier: Modifier, private suppressErrors?: boolean) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    if (this.modifyIf(target)) {
      // Modify this target
      try {
        return this.nestedStage
          .run(context, target)
          .map((newTarget) => newTarget.withThatTarget(target));
      } catch (ex) {
        // suppressErrors === true => Allowe this target to be returned unmodified
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
      this.nestedStage_ = getModifierStage(this.modifier);
    }

    return this.nestedStage_;
  }

  protected abstract modifyIf(target: Target): boolean;
}

/**
 * Runs {@link ModifyIfUntypedModifier.modifier} if the target has no explicit
 * scope type, ie if {@link Target.hasExplicitScopeType} is `false`.
 */
export class ModifyIfUntypedStage extends ModifyIfBaseStage {
  constructor(modifier: ModifyIfUntypedModifier) {
    super(modifier.modifier);
  }

  protected modifyIf(target: Target): boolean {
    return !target.hasExplicitScopeType;
  }
}

/**
 * Tries to convert target into token if:
 * {@link Target.hasExplicitScopeType} is `false` and
 * {@link Target.hasExplicitRange} is `false` and
 * {@link Target.contentRange.isEmpty} is `true`.
 */
export class ModifyUnTypedEmptyToTokenStage extends ModifyIfBaseStage {
  constructor() {
    super({ type: "containingScope", scopeType: { type: "token" } }, true);
  }

  protected modifyIf(target: Target): boolean {
    return (
      !target.hasExplicitScopeType &&
      !target.hasExplicitRange &&
      target.contentRange.isEmpty
    );
  }
}
