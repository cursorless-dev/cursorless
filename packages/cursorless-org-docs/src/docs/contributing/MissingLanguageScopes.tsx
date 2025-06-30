import {
  languageScopeSupport,
  scopeSupportFacetInfos,
  ScopeSupportFacetLevel,
  scopeSupportFacets,
  type ScopeSupportFacet,
  type ScopeType,
  type SimpleScopeTypeType,
} from "@cursorless/common";
import React, { useEffect, useState } from "react";

export function MissingLanguageScopes(): React.JSX.Element {
  const [showPrivate, setShowPrivate] = useState(false);
  const languageIds = Object.keys(languageScopeSupport).sort();

  return (
    <>
      <label className="ml-1">
        <input
          type="checkbox"
          checked={showPrivate}
          onChange={(e) => setShowPrivate(e.target.checked)}
        />
        Show private scopes
      </label>

      {languageIds.map((languageId) => (
        <Language languageId={languageId} showPrivate={showPrivate} />
      ))}
    </>
  );
}

function Language({
  languageId,
  showPrivate,
}: {
  languageId: string;
  showPrivate: boolean;
}): React.JSX.Element | null {
  const scopeSupport = languageScopeSupport[languageId] ?? {};

  const unsupportedFacets = scopeSupportFacets.filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.unsupported,
  );
  const unspecifiedFacets = scopeSupportFacets.filter(
    (facet) => scopeSupport[facet] == null,
  );
  const unsupportedScopes = facetsToScopes(unsupportedFacets, showPrivate);
  const unspecifiedScopes = facetsToScopes(unspecifiedFacets, showPrivate);

  if (unsupportedScopes.length === 0 && unspecifiedScopes.length === 0) {
    return null;
  }

  return (
    <>
      <h3>
        {languageId}

        <small className="ml-2 text-sm">
          <a href={`../../user/languages/${languageId}`}>link</a>
        </small>
      </h3>

      {renderFacets("Unsupported", unsupportedScopes)}
      {renderFacets("Unspecified", unspecifiedScopes)}
    </>
  );
}

function renderFacets(
  title: string,
  scopes: string[],
): React.JSX.Element | null {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(scopes.length < 4);
  }, [scopes]);

  if (scopes.length === 0) {
    return null;
  }

  const renderBody = () => {
    if (!open) {
      return null;
    }

    return (
      <div className="card__body">
        <ul>
          {scopes.map((scope) => {
            return <li key={scope}>{scope}</li>;
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className={"card" + (open ? " open" : "")}>
      <div className="card__header pointer" onClick={() => setOpen(!open)}>
        {title} ({scopes.length})
      </div>

      {renderBody()}
    </div>
  );
}

function facetsToScopes(facets: ScopeSupportFacet[], showPrivate: boolean) {
  return Array.from(
    new Set(
      facets.map((f) =>
        serializeScopeType(scopeSupportFacetInfos[f].scopeType),
      ),
    ),
  )
    .filter((scope) => showPrivate || !scope.startsWith("private."))
    .sort();
}

function serializeScopeType(
  scopeType: SimpleScopeTypeType | ScopeType,
): string {
  if (typeof scopeType === "string") {
    return scopeType;
  }
  return scopeType.type;
}
