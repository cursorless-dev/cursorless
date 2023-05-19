import {
  SimpleScopeTypeType,
  SnippetDefinition,
  SnippetScope,
} from "@cursorless/common";
import { SnippetOrigin } from "./mergeSnippets";

/**
 * Compares two snippet definitions by how specific their scope, breaking
 * ties by origin.
 * @param a One of the snippet definitions to compare
 * @param b The other snippet definition to compare
 * @returns A negative number if a should come before b, a positive number if b
 */
export function compareSnippetDefinitions(
  a: SnippetDefinitionWithOrigin,
  b: SnippetDefinitionWithOrigin,
): number {
  const scopeComparision = compareSnippetScopes(
    a.definition.scope,
    b.definition.scope,
  );

  if (scopeComparision !== 0) {
    return scopeComparision;
  }

  return a.origin - b.origin;
}

function compareSnippetScopes(
  a: SnippetScope | undefined,
  b: SnippetScope | undefined,
): number {
  if (a == null && b == null) {
    return 0;
  }

  if (a == null) {
    return -1;
  }

  if (b == null) {
    return 1;
  }

  const langIdsComparision = compareLangIds(a.langIds, b.langIds);

  if (langIdsComparision !== 0) {
    return langIdsComparision;
  }

  return compareScopeTypes(a.scopeTypes, b.scopeTypes);
}

function compareLangIds(
  a: string[] | undefined,
  b: string[] | undefined,
): number {
  if (a == null && b == null) {
    return 0;
  }

  if (a == null) {
    return -1;
  }

  if (b == null) {
    return 1;
  }

  return b.length - a.length;
}

function compareScopeTypes(
  a: SimpleScopeTypeType[] | undefined,
  b: SimpleScopeTypeType[] | undefined,
): number {
  if (a == null && b != null) {
    return -1;
  }

  if (b == null && a != null) {
    return 1;
  }

  return 0;
}

interface SnippetDefinitionWithOrigin {
  origin: SnippetOrigin;
  definition: SnippetDefinition;
}
