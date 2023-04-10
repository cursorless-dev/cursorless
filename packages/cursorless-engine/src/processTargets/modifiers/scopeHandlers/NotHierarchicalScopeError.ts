import { ScopeType } from "@cursorless/common";
import { scopeTypeToString } from "./scopeTypeUtil";

/**
 * Throw this error when the user requests a hierarchical feature of a scope
 * that is not hierarchical, eg `"grand line"`.
 */
export default class NotHierarchicalScopeError extends Error {
  /**
   *
   * @param scopeType The scopeType for the failed match to show to the user
   */
  constructor(scopeType: ScopeType) {
    super(`Cannot use hierarchical modifiers on ${scopeTypeToString(scopeType)}.`);
    this.name = "NotHierarchicalScopeError";
  }
}
