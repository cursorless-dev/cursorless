import { Target } from "../../../typings/target.types";
import {
  EveryScopeModifier,
  SimpleScopeType,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import ScopeTypeTarget from "../../targets/ScopeTypeTarget";

export interface SimpleEveryScopeModifier extends EveryScopeModifier {
  scopeType: SimpleScopeType;
}

/**
 * Returns a list of targets that are contained by the given input target. If
 * the range is empty then first expand to the default containing scope to use
 * for this scope and search there.  Delegates to the {@link ScopeHandler} for
 * the actual scope-specific logic, eg tree-sitter.
 */
export default class EveryScopeStage implements ModifierStage {
  constructor(private modifier: SimpleEveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): ScopeTypeTarget[] {
    // TODO: Instantiate the right scope handler based on the scope type and
    // let it do most of the work.
    // For now, let's only use this stage for syntax scopes, but in the future
    // we'll migrate LineStage, TokenStage, etc to use this as well.
  }
}
