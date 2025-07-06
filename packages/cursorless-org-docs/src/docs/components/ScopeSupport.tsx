import {
  prettifyLanguageName,
  prettifyScopeType,
  serializeScopeType,
  type ScopeSupportFacetInfo,
  type ScopeTypeType,
} from "@cursorless/common";
import { usePluginData } from "@docusaurus/useGlobalData";
import React, { useState } from "react";
import { calculateHighlights } from "./calculateHighlights";
import { Code } from "./Code";
import { H2, H3, H4, H5 } from "./Header";
import "./ScopeSupport.css";
import type { FacetValue, Fixture, RangeType, ScopeTests } from "./types";
import {
  getFacetInfo,
  isScopeInternal,
  nameComparator,
  prettifyFacet,
} from "./util";

interface Scopes {
  public: Scope[];
  internal: Scope[];
}

interface Scope {
  scopeTypeType: ScopeTypeType;
  name: string;
  facets: Facet[];
}

interface Facet {
  facet: FacetValue;
  name: string;
  info: ScopeSupportFacetInfo;
  fixtures: Fixture[];
}

interface Props {
  languageId?: string;
  scopeTypeType?: ScopeTypeType;
}

export function ScopeSupport({ languageId, scopeTypeType }: Props) {
  const scopeTests = usePluginData("scope-tests-plugin") as ScopeTests;
  const [scopes] = useState(
    getScopeFixtures(scopeTests, languageId, scopeTypeType),
  );
  const [rangeType, setRangeType] = useState<RangeType>("content");
  const [renderWhitespace, setRenderWhitespace] = useState(false);

  const renderOptions = () => {
    return (
      <div className="mb-4">
        <select
          value={rangeType}
          onChange={(e) => setRangeType(e.target.value as RangeType)}
        >
          <option value="content">Content range</option>
          <option value="removal">Removal range</option>
        </select>

        <label className="ml-1">
          <input
            type="checkbox"
            checked={renderWhitespace}
            onChange={(e) => setRenderWhitespace(e.target.checked)}
          />
          Render whitespace
        </label>
      </div>
    );
  };

  const renderInternalScopes = () => {
    if (scopes.internal.length === 0) {
      return null;
    }
    return (
      <>
        <H2>Internal scopes</H2>

        {languageId && (
          <p>
            The following are internal scopes. They are not intended for user
            interaction or spoken use. These scopes exist solely for internal
            Cursorless functionality.
          </p>
        )}

        {scopes.internal.map((scope) =>
          renderScope(
            languageId,
            scopeTypeType,
            rangeType,
            renderWhitespace,
            scope,
          ),
        )}
      </>
    );
  };

  return (
    <>
      <H2>Scopes</H2>

      {languageId && (
        <p>
          Below are visualizations of all our scope tests for this language.
          These were created primarily for testing purposes rather than as
          documentation. There are quite a few, and they may feel a bit
          overwhelming from a documentation standpoint.
        </p>
      )}

      {renderOptions()}

      {scopes.public.map((scope) =>
        renderScope(
          languageId,
          scopeTypeType,
          rangeType,
          renderWhitespace,
          scope,
        ),
      )}

      {renderInternalScopes()}
    </>
  );
}

function renderScope(
  languageId: string | undefined,
  scopeTypeType: ScopeTypeType | undefined,
  rangeType: RangeType,
  renderWhitespace: boolean,
  scope: Scope,
) {
  return (
    <div key={scope.scopeTypeType}>
      {scopeTypeType == null && <H3>{scope.name}</H3>}
      {scope.facets.map((facet, index) =>
        renderFacet(
          languageId,
          scopeTypeType,
          rangeType,
          renderWhitespace,
          facet,
          index,
        ),
      )}
    </div>
  );
}

function renderFacet(
  languageId: string | undefined,
  scopeTypeType: ScopeTypeType | undefined,
  rangeType: RangeType,
  renderWhitespace: boolean,
  facet: Facet,
  index: number,
) {
  let previousLanguageId: string | undefined;

  const renderFacetName = () => {
    if (scopeTypeType != null) {
      return (
        <H3 className="facet-name" title={facet.facet}>
          {facet.name}
        </H3>
      );
    }
    return (
      <H4 className="facet-name" title={facet.facet}>
        {`${index + 1}. ${facet.name}`}
      </H4>
    );
  };

  const renderLanguageId = (facetLanguageId: string) => {
    if (scopeTypeType != null && previousLanguageId !== facetLanguageId) {
      previousLanguageId = facetLanguageId;
      return (
        <H5 className="language-id" value={`${facet.name}-${facetLanguageId}`}>
          {prettifyLanguageName(facetLanguageId)}
        </H5>
      );
    }
    return null;
  };

  return (
    <div key={facet.facet}>
      {renderFacetName()}
      <i>{facet.info.description}</i>
      {facet.fixtures.map((fixture) => (
        <React.Fragment key={fixture.name}>
          {renderLanguageId(fixture.languageId)}
          <Code
            link={{
              name: "GitHub",
              url: `https://github.com/cursorless-dev/cursorless/blob/main/data/fixtures/${fixture.name}.scope`,
            }}
            languageId={languageId ?? fixture.languageId}
            renderWhitespace={renderWhitespace}
            highlights={calculateHighlights(fixture, rangeType)}
          >
            {fixture.code}
          </Code>
        </React.Fragment>
      ))}
    </div>
  );
}

function getScopeFixtures(
  scopeTests: ScopeTests,
  languageId: string | undefined,
  scopeTypeType: ScopeTypeType | undefined,
): Scopes {
  const scopeMap: Partial<Record<ScopeTypeType, Scope>> = {};
  const facetMap: Partial<Record<FacetValue, Facet>> = {};
  const languageIds = new Set<string>(
    languageId != null ? (scopeTests.imports[languageId] ?? [languageId]) : [],
  );

  for (const fixture of scopeTests.fixtures) {
    const info = getFacetInfo(fixture.languageId, fixture.facet);
    const fixtureScopeTypeType = serializeScopeType(info.scopeType);

    if (
      languageId != null &&
      (!languageIds.has(fixture.languageId) ||
        fixtureScopeTypeType.startsWith("private."))
    ) {
      continue;
    }

    if (scopeTypeType != null && fixtureScopeTypeType !== scopeTypeType) {
      continue;
    }

    if (scopeMap[fixtureScopeTypeType] == null) {
      scopeMap[fixtureScopeTypeType] = {
        scopeTypeType: fixtureScopeTypeType,
        name: prettifyScopeType(info.scopeType),
        facets: [],
      };
    }

    if (facetMap[fixture.facet] == null) {
      const facet = {
        facet: fixture.facet,
        name: prettifyFacet(fixture.facet),
        info,
        fixtures: [],
      };
      facetMap[fixture.facet] = facet;
      scopeMap[fixtureScopeTypeType].facets.push(facet);
    }

    switch (fixture.languageId) {
      case "javascript.core":
        fixture.languageId = "javascript";
        break;
      case "typescript.core":
        fixture.languageId = "typescript";
        break;
      case "javascript.jsx":
        fixture.languageId = "javascriptreact";
        break;
    }

    facetMap[fixture.facet]?.fixtures.push(fixture);
  }

  const result: Scopes = { public: [], internal: [] };

  Object.values(scopeMap)
    .sort(nameComparator)
    .forEach((scope) => {
      scope.facets.sort(nameComparator);
      scope.facets.forEach((f) => f.fixtures.sort(nameComparator));
      if (scopeTypeType == null && isScopeInternal(scope.scopeTypeType)) {
        result.internal.push(scope);
      } else {
        result.public.push(scope);
      }
    });

  return result;
}
