import {
  ScopeSupportFacetLevel,
  languageScopeSupport,
  scopeSupportFacets,
} from "@cursorless/common";
import * as React from "react";
import { ScopeSupportForLevel } from "./ScopeSupportForLevel";

interface Props {
  languageId: string;
}

export function ScopeSupport({ languageId }: Props): React.JSX.Element {
  const facetsSorted = [...scopeSupportFacets].sort();
  const scopeSupport = languageScopeSupport[languageId] ?? {};

  const supportedFacets = facetsSorted.filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.supported,
  );
  const supportedLegacyFacets = facetsSorted.filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.supportedLegacy,
  );
  const unsupportedFacets = facetsSorted.filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.unsupported,
  );
  const unspecifiedFacets = facetsSorted.filter(
    (facet) => scopeSupport[facet] == null,
  );

  return (
    <>
      <h2>Scopes</h2>

      <ScopeSupportForLevel
        facets={supportedFacets}
        title="Supported facets"
        subtitle="These facets are supported"
        open
      />

      <ScopeSupportForLevel
        facets={supportedLegacyFacets}
        title="Supported Legacy facets"
        subtitle="These facets are supported with the legacy implementation and should be migrated to the new implementation"
      />

      <ScopeSupportForLevel
        facets={unsupportedFacets}
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
        facets={unspecifiedFacets}
        title="Unspecified facets"
        subtitle="These facets are unspecified"
        description={
          <>
            Note that in many instances we actually do support these scopes and
            facets, but we have not yet updated 'languageScopeSupport' to
            reflect this fact.
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
