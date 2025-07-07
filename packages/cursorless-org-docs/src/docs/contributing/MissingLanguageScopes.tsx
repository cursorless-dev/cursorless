import {
  languageScopeSupport,
  scopeSupportFacetInfos,
  ScopeSupportFacetLevel,
  scopeSupportFacets,
  serializeScopeType,
  type ScopeSupportFacet,
} from "@cursorless/common";
import React, { useState } from "react";

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
        <Language
          key={languageId}
          languageId={languageId}
          showPrivate={showPrivate}
        />
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

  let unsupportedFacets = scopeSupportFacets
    .filter(
      (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.unsupported,
    )
    .sort();
  let unspecifiedFacets = scopeSupportFacets
    .filter((facet) => scopeSupport[facet] == null)
    .sort();

  if (!showPrivate) {
    unsupportedFacets = unsupportedFacets.filter((f) => !isPrivate(f));
    unspecifiedFacets = unspecifiedFacets.filter((f) => !isPrivate(f));
  }

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
  facets: string[],
): React.JSX.Element | null {
  const [open, setOpen] = useState(facets.length < 10);

  if (facets.length === 0) {
    return null;
  }

  const renderBody = () => {
    if (!open) {
      return null;
    }

    return (
      <div className="card__body">
        <ul>
          {facets.map((scope) => {
            return <li key={scope}>{scope}</li>;
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className={"card" + (open ? " open" : "")}>
      <div className="card__header pointer" onClick={() => setOpen(!open)}>
        {title} ({facets.length})
      </div>

      {renderBody()}
    </div>
  );
}

function isPrivate(facet: ScopeSupportFacet): boolean {
  const scopeType = serializeScopeType(scopeSupportFacetInfos[facet].scopeType);
  return scopeType.startsWith("private.");
}
