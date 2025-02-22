import type { ScopeIteratorRequirements } from "../scopeHandler.types";

/**
 * Returns whether the hints belong to the every scope modifier.
 */
export function isEveryScopeModifier(
  hints: ScopeIteratorRequirements,
): boolean {
  return hints.containment == null && hints.skipAncestorScopes;
}
