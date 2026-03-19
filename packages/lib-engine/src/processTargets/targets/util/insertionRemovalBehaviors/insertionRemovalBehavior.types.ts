import type { Range } from "@cursorless/lib-common";
import type { Target } from "../../../../typings/target.types";

export interface InsertionRemovalBehavior {
  getLeadingDelimiterTarget(): Target | undefined;
  getTrailingDelimiterTarget(): Target | undefined;
  getRemovalRange(): Range;
  insertionDelimiter: string | undefined;
}
