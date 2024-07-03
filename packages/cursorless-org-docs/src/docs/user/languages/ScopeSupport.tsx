import {
  ScopeSupportFacetLevel,
  languageScopeSupport,
  scopeSupportFacets,
  type ScopeSupportFacet,
} from "@cursorless/common";
import React from "react";

interface Props {
  languageId: string;
}

export default function ScopeSupport({ languageId }: Props) {
  const scopesSorted = [...scopeSupportFacets].sort();
  const scopeSupport = languageScopeSupport[languageId] ?? {};

  const supportedScopes = scopesSorted.filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.supported,
  );
  const supportedLegacyScopes = scopesSorted.filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.supportedLegacy,
  );
  const unsupportedScopes = scopesSorted.filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.unsupported,
  );
  const unspecifiedScopes = scopesSorted.filter(
    (facet) => scopeSupport[facet] == null,
  );

  return (
    <>
      {getContentForSupportLevel(
        supportedScopes,
        "Supported facets",
        "These facets are supported",
      )}
      {getContentForSupportLevel(
        supportedLegacyScopes,
        "Supported Legacy facets",
        "These facets are supported with the legacy implementation and should be migrated to the new implementation",
      )}
      {getContentForSupportLevel(
        unsupportedScopes,
        "Unsupported facets",
        "These facets are not supported yet and needs a developer to implement them",
      )}
      {getContentForSupportLevel(
        unspecifiedScopes,
        "Unspecified facets",
        <>
          These facets are unspecified <br />
          <i>
            Note that in many instances we actually do support these scopes, but
            we have not yet updated `languageScopeSupport` to reflect this fact
          </i>
        </>,
      )}
    </>
  );
}

function getContentForSupportLevel(
  facets: ScopeSupportFacet[],
  title: string,
  description: React.ReactNode,
) {
  if (facets.length === 0) {
    return null;
  }
  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>

      <ul>
        {facets.map((facet) => (
          <li>{facet}</li>
        ))}
      </ul>
    </div>
  );
}
