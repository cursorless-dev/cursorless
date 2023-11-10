import {Target} from "../typings/target.types";
import {ensureSingleEditor, calcIsReversed} from "../processTargets/TargetPipelineRunner";


export function targetsToContinuousTarget(
  anchorTarget: Target,
  activeTarget: Target,
  excludeAnchor: boolean = false,
  excludeActive: boolean = false
): Target {
  ensureSingleEditor(anchorTarget, activeTarget);

  const isReversed = calcIsReversed(anchorTarget, activeTarget);
  const startTarget = isReversed ? activeTarget : anchorTarget;
  const endTarget = isReversed ? anchorTarget : activeTarget;
  const excludeStart = isReversed ? excludeActive : excludeAnchor;
  const excludeEnd = isReversed ? excludeAnchor : excludeActive;

  return startTarget.createContinuousRangeTarget(
    isReversed,
    endTarget,
    !excludeStart,
    !excludeEnd
  );
}
