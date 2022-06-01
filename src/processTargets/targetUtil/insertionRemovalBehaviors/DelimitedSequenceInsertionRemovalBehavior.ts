import { Range } from "vscode";
import { Target } from "../../../typings/target.types";

export function getDelimitedSequenceRemovalRange(target: Target): Range {
  const delimiterTarget =
    target.getTrailingDelimiterTarget() ?? target.getLeadingDelimiterTarget();

  return delimiterTarget != null
    ? target.contentRange.union(delimiterTarget.contentRange)
    : target.contentRange;
}
