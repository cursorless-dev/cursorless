import type { ScopeIteratorRequirements } from "../scopeHandler.types";

export function isHintsEveryScope(hints: ScopeIteratorRequirements): boolean {
  return hints.containment == null && hints.skipAncestorScopes;
}
