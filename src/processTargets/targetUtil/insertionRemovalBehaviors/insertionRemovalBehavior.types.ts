import type { Range } from "../../../libs/common/ide";
import type { Target } from "../../../typings/target.types";

export default interface InsertionRemovalBehavior {
  getLeadingDelimiterTarget(): Target | undefined;
  getTrailingDelimiterTarget(): Target | undefined;
  getRemovalRange(): Range;
  insertionDelimiter: string | undefined;
}
