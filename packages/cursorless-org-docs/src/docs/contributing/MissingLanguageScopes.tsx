import {
  languageScopeSupport,
  scopeSupportFacetInfos,
  ScopeSupportFacetLevel,
  scopeSupportFacets,
  type ScopeSupportFacet,
  type ScopeType,
  type SimpleScopeTypeType,
} from "@cursorless/common";
import React from "react";

export function MissingLanguageScopes(): React.JSX.Element[] {
  return Object.keys(languageScopeSupport)
    .sort()
    .map((languageId) => <Language key={languageId} languageId={languageId} />);
}

function Language({
  languageId,
}: {
  languageId: string;
}): React.JSX.Element | null {
  const scopeSupport = languageScopeSupport[languageId] ?? {};

  const unsupportedFacets = scopeSupportFacets.filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.unsupported,
  );
  const unspecifiedFacets = scopeSupportFacets.filter(
    (facet) => scopeSupport[facet] == null,
  );

  if (unsupportedFacets.length === 0 && unspecifiedFacets.length === 0) {
    return null;
  }

  return (
    <>
      <h3>{languageId}</h3>
      {renderFacets("Unsupported", unsupportedFacets)}
      {renderFacets("Unspecified", unspecifiedFacets)}
    </>
  );
}

function renderFacets(
  title: string,
  facets: ScopeSupportFacet[],
): React.JSX.Element | null {
  const scopes = Array.from(
    new Set(
      facets.map((f) =>
        serializeScopeType(scopeSupportFacetInfos[f].scopeType),
      ),
    ),
  ).sort();

  if (scopes.length === 0) {
    return null;
  }

  return (
    <>
      {title} ({scopes.length})
      <ul>
        {scopes.map((scope) => {
          return <li key={scope}>{scope}</li>;
        })}
      </ul>
    </>
  );
}

function serializeScopeType(
  scopeType: SimpleScopeTypeType | ScopeType,
): string {
  if (typeof scopeType === "string") {
    return scopeType;
  }
  return scopeType.type;
}
