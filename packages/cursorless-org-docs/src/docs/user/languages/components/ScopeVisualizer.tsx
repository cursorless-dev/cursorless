import {
  Range,
  type ScopeSupportFacet,
  type ScopeSupportFacetInfo,
  type TextualScopeSupportFacet,
} from "@cursorless/common";
import React, { useState } from "react";
import scopeTestsJson from "../../../../../static/scopeTests.json";
import { Code, type Highlight } from "./Code";
import type { Fixture, ScopeTestsJson } from "./types";
import {
  getFacetInfo,
  prettifyFacet,
  prettifyScopeType,
  serializeScopeType,
} from "./util";

const scopeTests = scopeTestsJson as ScopeTestsJson;

type RangeType = "content" | "removal";

interface Scope {
  scope: string;
  facets: Facet[];
}

interface Facet {
  facet: ScopeSupportFacet | TextualScopeSupportFacet;
  name: string;
  info: ScopeSupportFacetInfo;
  fixtures: Fixture[];
}

interface Props {
  languageId: string;
}

export function ScopeVisualizer({ languageId }: Props) {
  const [scopes] = useState(getScopeFixtures(languageId));
  const [rangeType, setRangeType] = useState<RangeType>("content");
  const [renderWhitespace, setRenderWhitespace] = useState(false);

  const renderOptions = () => {
    return (
      <div className="mb-4">
        <select
          value={rangeType}
          onChange={(e) => setRangeType(e.target.value as RangeType)}
        >
          <option value="content">Content</option>
          <option value="removal">Removal</option>
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
      {renderOptions()}

      {scopes.map((scope) =>
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
    <div key={scope.scope}>
      <h3>[{scope.scope}]</h3>
      {scope.facets.map((f) =>
        renderFacet(languageId, rangeType, renderWhitespace, f),
      )}
    </div>
  );
}

function renderFacet(
  languageId: string,
  rangeType: RangeType,
  renderWhitespace: boolean,
  facet: Facet,
) {
  return (
    <div key={facet.facet}>
      <span className="facet-name" title={facet.facet}>
        {facet.name}
      </span>
      <br />
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
  let previousRange: Range | undefined;

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

      previousRange = range;
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

function getScopeFixtures(languageId: string): Scope[] {
  const languageIds = new Set<string>(
    scopeTests.imports[languageId] ?? [languageId],
  );
  const fixtures = scopeTests.fixtures.filter((f) =>
    languageIds.has(f.languageId),
  );
  const map: Record<string, Record<string, Facet>> = {};

  for (const fixture of fixtures) {
    const info = getFacetInfo(fixture.languageId, fixture.facet);
    let scope = serializeScopeType(info.scopeType);

    if (scope.startsWith("private.")) {
      continue;
    }

    scope = prettifyScopeType(scope);

    const facet = prettifyFacet(fixture.facet, true);
    if (map[scope] == null) {
      map[scope] = {};
    }
    if (map[scope][fixture.facet] == null) {
      map[scope][fixture.facet] = {
        facet: fixture.facet,
        name: facet,
        info,
        fixtures: [],
      };
    }
    map[scope][fixture.facet].fixtures.push(fixture);
  }

  return Object.keys(map)
    .sort()
    .map((scope): Scope => {
      const data = map[scope];
      const facets = Object.keys(data)
        .sort()
        .map((facet): Facet => {
          return data[facet];
        });
      return { scope, facets };
    });
}
