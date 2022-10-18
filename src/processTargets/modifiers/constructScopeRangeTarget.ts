import { Target } from "../../typings/target.types";
import { TargetScope } from "./scopeHandlers/scopeHandler.types";

export function constructScopeRangeTarget(
  isReversed: boolean,
  scope1: TargetScope,
  scope2: TargetScope
): Target[] {
  const target1 = scope1.getTarget(isReversed);
  const target2 = scope2.getTarget(isReversed);

  const isScope2After = target2.contentRange.start.isAfterOrEqual(
    target1.contentRange.start
  );

  const [startTarget, endTarget] = isScope2After
    ? [target1, target2]
    : [target2, target1];

  return [
    startTarget.createContinuousRangeTarget(isReversed, endTarget, true, true),
  ];
}
