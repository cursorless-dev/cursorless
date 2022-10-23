import { Scope } from "./scopeHandlers/scope.types";

/**
 * Given a list of scopes, returns the preferred scope, or `undefined` if
 * {@link scopes} is empty.  The preferred scope will always be the rightmost
 * scope.
 * @param scopes A list of scopes to choose from
 * @returns A single preferred scope, or `undefined` if {@link scopes} is empty
 */
export function getPreferredScope<T extends Scope>(scopes: T[]): T | undefined {
  return getRightScope(scopes);
}

/**
 * Given a list of scopes, returns the leftmost scope, or `undefined` if
 * {@link scopes} is empty.
 * @param scopes A list of scopes to choose from
 * @returns A single preferred scope, or `undefined` if {@link scopes} is empty
 */
export function getLeftScope<T extends Scope>(scopes: T[]): T | undefined {
  return getScopeHelper(scopes, (scope1, scope2) =>
    scope1.domain.start.isBefore(scope2.domain.start)
  );
}

/**
 * Given a list of scopes, returns the rightmost scope, or `undefined` if
 * {@link scopes} is empty.
 * @param scopes A list of scopes to choose from
 * @returns A single preferred scope, or `undefined` if {@link scopes} is empty
 */
export function getRightScope<T extends Scope>(scopes: T[]): T | undefined {
  return getScopeHelper(scopes, (scope1, scope2) =>
    scope1.domain.start.isAfter(scope2.domain.start)
  );
}

function getScopeHelper<T extends Scope>(
  scopes: T[],
  isScope1Preferred: (scope1: Scope, scope2: Scope) => boolean
): T | undefined {
  if (scopes.length === 0) {
    return undefined;
  }

  if (scopes.length === 1) {
    return scopes[0];
  }

  if (scopes.length > 2) {
    throw Error("Cannot compare more than two scopes.");
  }

  const [scope1, scope2] = scopes;

  return isScope1Preferred(scope1, scope2) ? scope1 : scope2;
}
