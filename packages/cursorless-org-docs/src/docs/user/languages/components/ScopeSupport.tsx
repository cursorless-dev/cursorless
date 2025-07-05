import {
  ScopeSupportFacetLevel,
  languageScopeSupport,
  scopeSupportFacetInfos,
  scopeSupportFacets,
  textualScopeSupportFacetInfos,
  type ScopeSupportFacet,
  type TextualScopeSupportFacet,
} from "@cursorless/common";
import * as React from "react";
import {
  ScopeSupportForLevel,
  type FacetWrapper,
} from "./ScopeSupportForLevel";

interface Props {
  languageId: string;
}

function getSupport(languageId: string): FacetWrapper[] {
  if (languageId === "plaintext") {
    return Object.keys(textualScopeSupportFacetInfos)
      .sort()
      .map((f) => {
        const facet = f as TextualScopeSupportFacet;
        return {
          facet,
          supportLevel: ScopeSupportFacetLevel.supported,
          info: textualScopeSupportFacetInfos[facet],
        };
      });
  }
  const supportLevels = languageScopeSupport[languageId] ?? {};
  return [...scopeSupportFacets].sort().map((f) => {
    const facet = f as ScopeSupportFacet;
    return {
      facet,
      supportLevel: supportLevels[facet],
      info: scopeSupportFacetInfos[facet],
    };
  });
}

export function ScopeSupport({ languageId }: Props): React.JSX.Element {
  const facets = getSupport(languageId);
  const supportedFacets = facets.filter(
    (facet) => facet.supportLevel === ScopeSupportFacetLevel.supported,
  );
  const unsupportedFacets = facets.filter(
    (facet) => facet.supportLevel === ScopeSupportFacetLevel.unsupported,
  );
  const unspecifiedFacets = facets.filter(
    (facet) => facet.supportLevel == null,
  );

  return (
    <>
      <ScopeSupportForLevel
        facets={supportedFacets}
        title="Supported facets"
        subtitle="These scope facets are supported"
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
