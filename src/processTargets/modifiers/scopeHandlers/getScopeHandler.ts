import { LineScopeHandler, TokenScopeHandler } from ".";
import type { ScopeType } from "../../../typings/targetDescriptor.types";
import type { ScopeHandler } from "./scopeHandler.types";

/**
 * Returns a scope handler for the given scope type and language id
 *
 * @param scopeType The scope type for which to get a scope handler
 * @param _languageId The language id of the document where the scope handler
 * will be used
 * @returns A scope handler for the given scope type and language id, or
 * undefined if the given scope type / language id combination is still using
 * legacy pathways
 */
export default function getScopeHandler(
  scopeType: ScopeType,
  _languageId: string
): ScopeHandler | undefined {
  switch (scopeType.type) {
    case "token":
      return new TokenScopeHandler(scopeType, _languageId);
    case "line":
      return new LineScopeHandler(scopeType, _languageId);
    default:
      return undefined;
  }
}
