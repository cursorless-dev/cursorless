import {
  ScopeSupportFacetLevel,
  languageScopeSupport,
  scopeSupportFacets,
} from "@cursorless/common";
import React from "react";
import { ScopeSupportForLevel } from "./ScopeSupportForLevel";

interface Props {
  languageId: string;
}

export function ScopeSupport({ languageId }: Props): JSX.Element {
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
      <ScopeSupportForLevel
        facets={supportedScopes}
        title="Supported facets"
        subtitle="These facets are supported"
        expanded
      />

      <ScopeSupportForLevel
        facets={supportedLegacyScopes}
        title="Supported Legacy facets"
        subtitle="These facets are supported with the legacy implementation and should be migrated to the new implementation"
      />

      <ScopeSupportForLevel
        facets={unsupportedScopes}
        title="Unsupported facets"
        subtitle="These facets are not supported yet and needs a developer to implement them"
        description={
          <>
            We would happily accept{" "}
            <a href="https://www.cursorless.org/docs/contributing/adding-a-new-scope">
              contributions
            </a>
          </>
        }
      />

      <ScopeSupportForLevel
        facets={unspecifiedScopes}
        title="Unspecified facets"
        subtitle="These facets are unspecified"
        description={
          <>
            Note that in many instances we actually do support these scopes, but
            we have not yet updated 'languageScopeSupport' to reflect this fact.
            <br />
            We would happily accept{" "}
            <a href="https://www.cursorless.org/docs/contributing/adding-a-new-scope">
              contributions
            </a>
          </>
        }
      />
    </>
  );
}
