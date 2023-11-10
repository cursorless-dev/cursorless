import type {Target} from "../../typings/target.types";
import {UntypedTarget} from "../targets/UntypedTarget";
import {createContinuousRange} from "./createContinuousRange";


export function createContinuousRangeUntypedTarget(
  isReversed: boolean,
  startTarget: Target,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean
): UntypedTarget {
  return new UntypedTarget({
    editor: startTarget.editor,
    isReversed,
    hasExplicitRange: true,
    contentRange: createContinuousRange(
      startTarget,
      endTarget,
      includeStart,
      includeEnd
    ),
    isToken: startTarget.isToken && endTarget.isToken,
  });
}
