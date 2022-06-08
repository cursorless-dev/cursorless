import { Range } from "vscode";
import { Target } from "../../../typings/target.types";

export default interface InsertionRemovalBehavior {
  getLeadingDelimiterTarget(): Target | undefined;
  getTrailingDelimiterTarget(): Target | undefined;
  getRemovalRange(): Range;
  insertionDelimiter: string | undefined;
}
