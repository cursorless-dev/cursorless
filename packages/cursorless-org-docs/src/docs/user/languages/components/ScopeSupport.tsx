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
        title={"Supported facets"}
        description={"These facets are supported"}
      />

      <ScopeSupportForLevel
        facets={supportedLegacyScopes}
        title={"Supported Legacy facets"}
        description={
          "These facets are supported with the legacy implementation and should be migrated to the new implementation"
        }
      />

      <ScopeSupportForLevel
        facets={unsupportedScopes}
        title={"Unsupported facets"}
        description={
          <>
            These facets are not supported yet and needs a developer to
            implement them. <br />
            We would happily accept
            [contributions](https://www.cursorless.org/docs/contributing/adding-a-new-scope).
          </>
        }
      />

      <ScopeSupportForLevel
        facets={unspecifiedScopes}
        title={"Unspecified facets"}
        description={
          <>
            These facets are unspecified <br />
            <i>
              Note that in many instances we actually do support these scopes,
              but we have not yet updated `languageScopeSupport` to reflect this
              fact. We would happily accept
              [contributions](https://www.cursorless.org/docs/contributing/adding-a-new-scope).
            </i>
          </>
        }
      />
    </>
  );
}
