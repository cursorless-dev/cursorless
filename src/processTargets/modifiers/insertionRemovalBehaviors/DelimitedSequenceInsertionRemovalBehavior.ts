import { Range } from "vscode";
import { Target } from "../../../typings/target.types";
import InsertionRemovalBehavior from "./insertionRemovalBehavior.types";

interface Config {
  getLeadingDelimiterTarget(): Target | undefined;
  getTrailingDelimiterTarget(): Target | undefined;
  delimiterString: string;
}

export default class DelimitedSequenceInsertionRemovalBehavior
  implements InsertionRemovalBehavior
{
  constructor(private target: Target, private config: Config) {}

  delimiterString = this.config.delimiterString;
  getLeadingDelimiterTarget = this.config.getLeadingDelimiterTarget;
  getTrailingDelimiterTarget = this.config.getTrailingDelimiterTarget;

  getRemovalRange(): Range {
    const delimiterTarget =
      this.getTrailingDelimiterTarget() ?? this.getLeadingDelimiterTarget();

    return delimiterTarget != null
      ? this.target.contentRange.union(delimiterTarget.getRemovalRange())
      : this.target.contentRange;
  }
}
