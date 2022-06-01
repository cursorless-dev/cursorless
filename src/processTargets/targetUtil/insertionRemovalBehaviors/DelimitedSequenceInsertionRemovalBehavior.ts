import { Range } from "vscode";
import { Target } from "../../../typings/target.types";

/**
 * Constructs a removal range for the given target that includes either the
 * trailing or leading delimiter
 * @param target The target to get the removal range for
 * @param contentRange Can be used to override the content range instead of
 * using the one on the target
 * @returns The removal range for the given target
 */
export function getDelimitedSequenceRemovalRange(
  target: Target,
  contentRange?: Range
): Range {
  contentRange = contentRange ?? target.contentRange;

  const delimiterTarget =
    target.getTrailingDelimiterTarget() ?? target.getLeadingDelimiterTarget();

  return delimiterTarget != null
    ? contentRange.union(delimiterTarget.contentRange)
    : contentRange;
}
