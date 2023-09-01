import type { Range } from "@cursorless/common";
import type { Target } from "../../../typings/target.types";

/**
 * Constructs a removal range for the given target that includes either the
 * trailing or leading delimiter
 * @param target The target to get the removal range for
 * @returns The removal range for the given target
 */
export function getDelimitedSequenceRemovalRange(target: Target): Range {
  const { contentRange } = target;

  const delimiterTarget =
    target.getTrailingDelimiterTarget() ?? target.getLeadingDelimiterTarget();

  return delimiterTarget != null
    ? contentRange.union(delimiterTarget.contentRange)
    : contentRange;
}
