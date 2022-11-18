import type { Range } from "@cursorless/common";
import type { Target } from "../../../typings/target.types";

export default interface InsertionRemovalBehavior {
  getLeadingDelimiterTarget(): Target | undefined;
  getTrailingDelimiterTarget(): Target | undefined;
  getRemovalRange(): Range;
  insertionDelimiter: string | undefined;
}
