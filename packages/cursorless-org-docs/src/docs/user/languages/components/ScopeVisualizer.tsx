import { Range } from "@cursorless/common";
import React, { useState } from "react";
import scopeTestsJson from "../../../../../static/scopeTests.json";
import { Code, type Highlight } from "./Code";
import type { Fixture, ScopeTestsJson } from "./types";

type RangeType = "content" | "removal";

const scopeTests = scopeTestsJson as ScopeTestsJson;

interface Props {
  languageId: string;
}

export function ScopeVisualizer({ languageId }: Props) {
  const [fixtures] = useState(getFixtures(languageId));
  const [rangeType, setRangeType] = useState<RangeType>("content");
  const [renderWhitespace, setRenderWhitespace] = useState(false);

  return (
    <div>
      <select
        value={rangeType}
        onChange={(e) => setRangeType(e.target.value as RangeType)}
      >
        <option value="content">Content</option>
        <option value="removal">Removal</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={renderWhitespace}
          onChange={(e) => setRenderWhitespace(e.target.checked)}
        />
        Render whitespace
      </label>

      {fixtures.map((f) =>
        renderFixture(languageId, rangeType, renderWhitespace, f),
      )}
    </div>
  );
}

function renderFixture(
  languageId: string,
  rangeType: RangeType,
  renderWhitespace: boolean,
  fixture: Fixture,
) {
  const highlights = getHighlights(fixture, rangeType);
  return (
    <div key={fixture.name}>
      {fixture.facet}
      <Code
        languageId={languageId}
        renderWhitespace={renderWhitespace}
        highlights={highlights}
      >
        {fixture.code}
      </Code>
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

function getFixtures(languageId: string): Fixture[] {
  const languageIds = new Set<string>(
    scopeTests.imports[languageId] ?? [languageId],
  );
  return scopeTests.fixtures.filter((f) => languageIds.has(f.languageId));
}
