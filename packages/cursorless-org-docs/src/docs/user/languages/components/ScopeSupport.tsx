import {
  Range,
  serializeScopeType,
  type ScopeSupportFacetInfo,
  type ScopeTypeType,
} from "@cursorless/common";
import { usePluginData } from "@docusaurus/useGlobalData";
import React, { useState } from "react";
import { Code, type Highlight } from "./Code";
import { H2, H3, H4 } from "./Header";
import "./ScopeSupport.css";
import type { FacetValue, Fixture, ScopeTests } from "./types";
import {
  getFacetInfo,
  isScopeInternal,
  nameComparator,
  prettifyFacet,
  prettifyScopeType,
} from "./util";

type RangeType = "content" | "removal";

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
  languageId: string;
}

export function ScopeSupport({ languageId }: Props) {
  const scopeTests = usePluginData("scope-tests-plugin") as ScopeTests;
  const [scopes] = useState(getScopeFixtures(scopeTests, languageId));
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

  return (
    <>
      <H2>Scopes</H2>

      <p>
        Below are visualizations of all our scope tests for this language. These
        were created primarily for testing purposes rather than as
        documentation. There are quite a few, and they may feel a bit
        overwhelming from a documentation standpoint.
      </p>

      {renderOptions()}

      {scopes.public.map((scope) =>
        renderScope(languageId, rangeType, renderWhitespace, scope),
      )}

      <H2>Internal scopes</H2>

      <p>
        The following are internal scopes. They are not intended for user
        interaction or spoken use. These scopes exist solely for internal
        Cursorless functionality.
      </p>

      {scopes.internal.map((scope) =>
        renderScope(languageId, rangeType, renderWhitespace, scope),
      )}
    </>
  );
}

function renderScope(
  languageId: string,
  rangeType: RangeType,
  renderWhitespace: boolean,
  scope: Scope,
) {
  return (
    <div key={scope.scopeTypeType}>
      <H3>{scope.name}</H3>
      {scope.facets.map((f, i) =>
        renderFacet(languageId, rangeType, renderWhitespace, f, i),
      )}
    </div>
  );
}

function renderFacet(
  languageId: string,
  rangeType: RangeType,
  renderWhitespace: boolean,
  facet: Facet,
  index: number,
) {
  return (
    <div key={facet.facet}>
      <H4 className="facet-name" title={facet.facet}>
        {`${index + 1}. ${facet.name}`}
      </H4>
      <i>{facet.info.description}</i>
      {facet.fixtures.map((fixture) => (
        <Code
          key={fixture.name}
          languageId={languageId}
          renderWhitespace={renderWhitespace}
          highlights={getHighlights(fixture, rangeType)}
        >
          {fixture.code}
        </Code>
      ))}
    </div>
  );
}

function getHighlights(fixture: Fixture, rangeType: RangeType): Highlight[] {
  const highlights: Highlight[] = [];
  const domainRanges: Range[] = [];

  for (const scope of fixture.scopes) {
    const conciseRanges =
      rangeType === "content"
        ? scope.targets.map((t) => t.content)
        : scope.targets.map((t) => t.removal ?? t.content);
    const ranges = conciseRanges.map((r) => Range.fromConcise(r));

    if (scope.domain != null && !conciseRanges.includes(scope.domain)) {
      domainRanges.push(Range.fromConcise(scope.domain));
    }

    for (const r of ranges) {
      let range = r;

      const overlap = highlights
        .map((h) => getOverlap(h.range, range))
        .find((o) => o != null);

      if (overlap != null) {
        highlights.push({
          type: rangeType,
          range: overlap,
        });
        range = new Range(overlap.end, range.end);
      }

      highlights.push({
        type: rangeType,
        range,
      });
    }
  }

  for (const range of domainRanges) {
    if (highlights.every((h) => !hasOverlap(h.range, range))) {
      highlights.push({
        type: "domain",
        range,
      });
    }
  }

  if (
    highlights.some((h) => highlights.some((o) => hasOverlap(h.range, o.range)))
  ) {
    console.error("Overlapping highlights detected:");
    console.error(fixture.name);
    console.error(highlights);
  }

  return highlights;
}

function hasOverlap(a: Range, b: Range): boolean {
  return getOverlap(a, b) != null;
}

function getOverlap(a: Range, b: Range): Range | null {
  const intersection = a.intersection(b);
  return intersection != null &&
    !intersection.isEmpty &&
    !a.contains(b) &&
    !b.contains(a)
    ? intersection
    : null;
}

function getScopeFixtures(scopeTests: ScopeTests, languageId: string): Scopes {
  const languageIds = new Set<string>(
    scopeTests.imports[languageId] ?? [languageId],
  );
  const fixtures = scopeTests.fixtures.filter((f) =>
    languageIds.has(f.languageId),
  );
  const scopeMap: Partial<Record<ScopeTypeType, Scope>> = {};
  const facetMap: Partial<Record<FacetValue, Facet>> = {};

  for (const fixture of fixtures) {
    const info = getFacetInfo(fixture.languageId, fixture.facet);
    const scopeTypeType = serializeScopeType(info.scopeType);

    if (scopeTypeType.startsWith("private.")) {
      continue;
    }

    if (scopeMap[scopeTypeType] == null) {
      scopeMap[scopeTypeType] = {
        scopeTypeType,
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
      scopeMap[scopeTypeType].facets.push(facet);
    }

    facetMap[fixture.facet]?.fixtures.push(fixture);
  }

  const result: Scopes = { public: [], internal: [] };

  Object.values(scopeMap)
    .sort(nameComparator)
    .forEach((scope) => {
      scope.facets.sort(nameComparator);
      scope.facets.forEach((f) => f.fixtures.sort(nameComparator));
      if (isScopeInternal(scope.scopeTypeType)) {
        result.internal.push(scope);
      } else {
        result.public.push(scope);
      }
    });

  return result;
}
