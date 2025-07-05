import { Range } from "@cursorless/common";
import React, { useState } from "react";
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

      {fixtures.map((f) => renderFixture(f, rangeType, renderWhitespace))}
    </div>
  );
}

function renderFixture(
  fixture: Fixture,
  rangeType: RangeType,
  renderWhitespace: boolean,
) {
  const highlights: Highlight[] = [];

  let previousRange: Range | undefined;

  for (const scope of fixture.scopes) {
    const conciseRange =
      rangeType === "content"
        ? scope.content
        : (scope.removal ?? scope.content);
    const range = Range.fromConcise(conciseRange);

    // TODO: fix overlapping ranges
    if (previousRange != null && previousRange.intersection(range) != null) {
      // If the previous range intersects with the current range, we skip
      // highlighting the current range to avoid overlapping highlights
      break;
    }

    if (scope.domain != null && scope.domain !== conciseRange) {
      highlights.push({
        type: "domain",
        range: Range.fromConcise(scope.domain),
      });
    }

    highlights.push({
      type: rangeType,
      range,
    });

    previousRange = range;
  }

  return (
    <div key={fixture.name}>
      {fixture.facet}
      <Code
        languageId={fixture.languageId}
        renderWhitespace={renderWhitespace}
        highlights={highlights}
      >
        {fixture.code}
      </Code>
    </div>
  );
}
