import { Range } from "@cursorless/common";
import React, { useEffect, useState } from "react";
import { createCssVariablesTheme } from "shiki";
import scopeTestsExport from "../../../../../static/scopeTests.json";
import { Code, Highlight } from "./Code";

type RangeType = "content" | "removal";

interface Scope {
  content: string;
  removal?: string;
  domain?: string;
  insertionDelimiter?: string;
}

interface Fixture {
  name: string;
  facet: string;
  languageId: string;
  code: string;
  scopes: Scope[];
}

const scopeTests = scopeTestsExport as Fixture[];

interface Props {
  languageId: string;
}

const myTheme = createCssVariablesTheme();

export function ScopeVisualizer({ languageId }: Props) {
  const [fixtures] = useState(
    scopeTests.filter((s) => s.languageId === languageId),
  );
  const [rangeType, setRangeType] = useState<RangeType>("content");

  return (
    <div>
      <select
        value={rangeType}
        onChange={(e) => setRangeType(e.target.value as RangeType)}
      >
        <option value="content">Content</option>
        <option value="removal">Removal</option>
      </select>

      {fixtures.map((f) => renderFixture(f, rangeType))}
    </div>
  );
}

function renderFixture(fixture: Fixture, rangeType: RangeType) {
  const highlights: Highlight[] = [];

  for (const scope of fixture.scopes) {
    const range =
      rangeType === "content"
        ? scope.content
        : (scope.removal ?? scope.content);

    if (scope.domain != null && scope.domain !== range) {
      highlights.push({
        type: "domain",
        range: Range.fromConcise(scope.domain),
      });
    }

    highlights.push({
      type: rangeType,
      range: Range.fromConcise(range),
    });
  }

  return (
    <div key={fixture.name}>
      {fixture.facet}
      <Code languageId={fixture.languageId} highlights={highlights}>
        {fixture.code}
      </Code>
    </div>
  );
}
