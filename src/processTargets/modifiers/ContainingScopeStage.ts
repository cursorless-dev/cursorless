import { NoContainingScopeError } from "../../errors";
import type { Target } from "../../typings/target.types";
import type { ContainingScopeModifier } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import getScopeHandler from "./scopeHandlers/getScopeHandler";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import getLegacyScopeStage from "./getLegacyScopeStage";
import {
  getLeftScope,
  getPreferredScope,
  getRightScope,
} from "./getPreferredScope";

export class ContainingScopeStage implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const {
      isReversed,
      editor,
      contentRange: { start, end },
    } = target;
    const { scopeType } = this.modifier;

    const scopeHandler = getScopeHandler(
      scopeType,
      target.editor.document.languageId
    );

    if (scopeHandler == null) {
      return getLegacyScopeStage(this.modifier).run(context, target);
    }

    const startScopes = scopeHandler.getScopesTouchingPosition(editor, start);

    if (startScopes.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    if (end.isEqual(start)) {
      return [getPreferredScope(startScopes)!.getTarget(isReversed)];
    }

    const startScope = getRightScope(startScopes)!;

    if (startScope.domain.contains(end)) {
      return [startScope.getTarget(isReversed)];
    }

    const endScopes = scopeHandler.getScopesTouchingPosition(editor, end);
    const endScope = getLeftScope(endScopes);

    if (endScope == null) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return [constructScopeRangeTarget(isReversed, startScope, endScope)];
  }
}
