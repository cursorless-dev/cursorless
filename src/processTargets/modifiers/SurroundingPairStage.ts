import {
  ContainingSurroundingPairModifier,
  Target,
} from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import SurroundingPairTarget from "../targets/SurroundingPairTarget";
import { processSurroundingPair } from "./surroundingPair";

/**
 * Applies the surrounding pair modifier to the given selection. First looks to
 * see if the target is itself adjacent to or contained by a modifier token. If
 * so it will expand the selection to the opposite delimiter token. Otherwise,
 * or if the opposite token wasn't found, it will proceed by finding the
 * smallest pair of delimiters which contains the selection.
 *
 * @param context Context to be leveraged by modifier
 * @param selection The selection to process
 * @param modifier The surrounding pair modifier information
 * @returns The new selection expanded to the containing surrounding pair or
 * `null` if none was found
 */
export default class SurroundingPairStage implements ModifierStage {
  constructor(private modifier: ContainingSurroundingPairModifier) {}

  run(
    context: ProcessedTargetsContext,
    target: Target
  ): SurroundingPairTarget[] {
    return processedSurroundingPairTarget(this.modifier, context, target);
  }
}

function processedSurroundingPairTarget(
  modifier: ContainingSurroundingPairModifier,
  context: ProcessedTargetsContext,
  target: Target
): SurroundingPairTarget[] {
  const pairInfo = processSurroundingPair(
    context,
    target.editor,
    target.contentRange,
    modifier.scopeType
  );

  if (pairInfo == null) {
    throw new Error("Couldn't find containing pair");
  }

  return [
    new SurroundingPairTarget({
      ...pairInfo,
      editor: target.editor,
      isReversed: target.isReversed,
    }),
  ];
}
