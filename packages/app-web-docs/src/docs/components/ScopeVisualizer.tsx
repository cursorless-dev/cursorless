import { usePluginData } from "@docusaurus/useGlobalData";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { generateDecorations } from "./calculateHighlights";
import { Code } from "./Code";
import type { Fixture, RangeType } from "./types";
import { getFacetInfo } from "./util";

interface ScopeVisualizerContextValue {
  fixtures: ReadonlyMap<string, Fixture>;
  rangeType: RangeType;
  setRangeType: Dispatch<SetStateAction<RangeType>>;
  renderWhitespace: boolean;
  setRenderWhitespace: Dispatch<SetStateAction<boolean>>;
}

const ScopeVisualizerContext = createContext<
  ScopeVisualizerContextValue | undefined
>(undefined);

export function ScopeVisualizerProvider({ children }: { children: ReactNode }) {
  const scopeTests = usePluginData("scope-tests-plugin") as Fixture[];
  const [rangeType, setRangeType] = useState<RangeType>("content");
  const [renderWhitespace, setRenderWhitespace] = useState(true);
  const fixtures = useMemo(
    () => new Map(scopeTests.map((fixture) => [fixture.name, fixture])),
    [scopeTests],
  );
  const value = useMemo(
    () => ({
      fixtures,
      rangeType,
      setRangeType,
      renderWhitespace,
      setRenderWhitespace,
    }),
    [fixtures, rangeType, renderWhitespace],
  );

  return (
    <ScopeVisualizerContext.Provider value={value}>
      {children}
    </ScopeVisualizerContext.Provider>
  );
}

export function ScopeVisualizerOptions() {
  const { rangeType, renderWhitespace, setRangeType, setRenderWhitespace } =
    useScopeVisualizer();

  return (
    <div className="mb-4">
      <select
        className="form-select form-select-sm d-inline-block w-auto"
        value={rangeType}
        onChange={(event) =>
          setRangeType(event.currentTarget.value as RangeType)
        }
      >
        <option value="content">Content range</option>
        <option value="removal">Removal range</option>
        <option value="blend">Blended ranges</option>
      </select>

      <label className="ms-2">
        <input
          type="checkbox"
          className="me-1"
          checked={renderWhitespace}
          onChange={(event) => setRenderWhitespace(event.currentTarget.checked)}
        />
        Render whitespace
      </label>
    </div>
  );
}

interface ScopeProps {
  fixtureName: string;
  languageId?: string;
}

export function ScopeVisualizer({ fixtureName, languageId }: ScopeProps) {
  const { fixtures, rangeType, renderWhitespace } = useScopeVisualizer();
  const fixture = fixtures.get(fixtureName);

  if (fixture == null) {
    throw new Error(`Unknown scope fixture: ${fixtureName}`);
  }

  const facetInfo = getFacetInfo(fixture.languageId, fixture.facet);

  return (
    <Code
      // oxlint-disable-next-line react_perf/jsx-no-new-object-as-prop
      link={{
        name: "GitHub",
        url: `https://github.com/cursorless-dev/cursorless/blob/main/resources/fixtures/${fixture.name}.scope`,
      }}
      languageId={languageId ?? normalizeLanguageId(fixture.languageId)}
      renderWhitespace={renderWhitespace}
      decorations={generateDecorations(
        fixture,
        rangeType,
        facetInfo.isIteration ?? false,
      )}
    >
      {fixture.code}
    </Code>
  );
}

function useScopeVisualizer(): ScopeVisualizerContextValue {
  const value = useContext(ScopeVisualizerContext);
  if (value == null) {
    throw new Error(
      "Scope visualizer components must be used within ScopeVisualizerProvider",
    );
  }
  return value;
}

function normalizeLanguageId(languageId: string): string {
  switch (languageId) {
    case "javascript.core":
      return "javascript";
    case "typescript.core":
      return "typescript";
    case "javascript.jsx":
      return "javascriptreact";
    default:
      return languageId;
  }
}
