import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  SimpleScopeType,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import ScopeTypeTarget from "../../targets/ScopeTypeTarget";

export interface SimpleContainingScopeModifier extends ContainingScopeModifier {
  scopeType: SimpleScopeType;
}

/**
 * Expands from input target to the smallest containing scope for the given
 * scope type.  Delegates to the {@link ScopeHandler} for the actual
 * scope-specific logic, eg tree-sitter.
 */
export default class ContainingScopeStage implements ModifierStage {
  constructor(private modifier: SimpleContainingScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): ScopeTypeTarget[] {
    // TODO: Instantiate the right scope handler based on the scope type and
    // let it do most of the work.
    // For now, let's only use this stage for syntax scopes, but in the future
    // we'll migrate LineStage, TokenStage, etc to use this as well.
    //
    // Note that this function will implement the algorithm described in
    // https://github.com/cursorless-dev/cursorless/pull/629#issuecomment-1136090441,
    // calling `scopeHandler.getScopeContainingPosition` at the start and then
    // end of the target range.
  }
}
