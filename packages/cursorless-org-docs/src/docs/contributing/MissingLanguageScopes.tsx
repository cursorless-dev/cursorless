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
      <h3>
        {languageId}

        <small className="ml-2 text-sm">
          <a href={`../../user/languages/${languageId}`}>link</a>
        </small>
      </h3>
      {renderFacets("Unsupported", unsupportedFacets)}
      {renderFacets("Unspecified", unspecifiedFacets)}
    </>
  );
}

function renderFacets(
  title: string,
  facets: ScopeSupportFacet[],
): React.JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [scopes, setScopes] = useState<string[]>([]);

  useEffect(() => {
    const scopes = Array.from(
      new Set(
        facets.map((f) =>
          serializeScopeType(scopeSupportFacetInfos[f].scopeType),
        ),
      ),
    ).sort();
    setScopes(scopes);
    setOpen(scopes.length < 4);
  }, []);

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

function serializeScopeType(
  scopeType: SimpleScopeTypeType | ScopeType,
): string {
  if (typeof scopeType === "string") {
    return scopeType;
  }
  return scopeType.type;
}
