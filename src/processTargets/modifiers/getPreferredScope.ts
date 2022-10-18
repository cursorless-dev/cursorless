import { Scope } from "./scopeHandlers/scope.types";

export function getPreferredScope<T extends Scope>(scopes: T[]): T | undefined {
  return getScopeHelper(
    scopes,
    (scope1, scope2) =>
      scope1.isPreferredOver?.(scope2) ??
      scope1.domain.start.isAfter(scope2.domain.start)
  );
}

export function getLeftScope<T extends Scope>(scopes: T[]): T | undefined {
  return getScopeHelper(scopes, (scope1, scope2) =>
    scope1.domain.start.isBefore(scope2.domain.start)
  );
}

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
