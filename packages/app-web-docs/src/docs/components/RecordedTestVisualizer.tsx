import { usePluginData } from "@docusaurus/useGlobalData";
import type { Dispatch, JSX, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { DecorationItem } from "shiki";
import type {
  SelectionPlainObject,
  TestCaseSnapshot,
} from "@cursorless/lib-common";
import { BorderStyle, plainObjectToSelection } from "@cursorless/lib-common";
import { Code } from "./Code";
import { highlightColors } from "./highlightColors";
import { highlightToDecoration } from "./highlightsToDecorations";
import type { RecordedTest } from "./types";

interface RecordedTestVisualizerContextValue {
  fixtures: ReadonlyMap<string, RecordedTest>;
  renderWhitespace: boolean;
  setRenderWhitespace: Dispatch<SetStateAction<boolean>>;
}

const RecordedTestVisualizerContext = createContext<
  RecordedTestVisualizerContextValue | undefined
>(undefined);

export function RecordedTestVisualizerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const recordedTests = usePluginData(
    "recorded-tests-plugin",
  ) as RecordedTest[];
  const [renderWhitespace, setRenderWhitespace] = useState(true);
  const fixtures = useMemo(
    () =>
      new Map(
        recordedTests.map((recordedTest) => [recordedTest.name, recordedTest]),
      ),
    [recordedTests],
  );
  const value = useMemo(
    () => ({
      fixtures,
      renderWhitespace,
      setRenderWhitespace,
    }),
    [fixtures, renderWhitespace],
  );

  return (
    <RecordedTestVisualizerContext.Provider value={value}>
      {children}
    </RecordedTestVisualizerContext.Provider>
  );
}

export function RecordedTestVisualizerOptions() {
  const { renderWhitespace, setRenderWhitespace } = useRecordedTestVisualizer();

  return (
    <div className="mb-4">
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

interface ModifierProps {
  fixtureName: string;
}

export function RecordedTestVisualizer({ fixtureName }: ModifierProps) {
  const { fixtures, renderWhitespace } = useRecordedTestVisualizer();
  const test = fixtures.get(fixtureName);

  if (test == null) {
    throw new Error(`Unknown recorded test fixture: ${fixtureName}`);
  }

  const { fixture, path } = test;
  const { languageId, initialState, finalState } = fixture;

  if (finalState == null) {
    throw new Error(`Fixture ${fixtureName} does not have a final state`);
  }

  // oxlint-disable-next-line react_perf/jsx-no-new-object-as-prop
  const link = {
    name: "GitHub",
    url: `https://github.com/cursorless-dev/cursorless/blob/main/resources/fixtures/recorded/docs/${path}`,
  };

  return (
    <div className="row">
      <div className="col">
        Input
        <CodeState
          renderWhitespace={renderWhitespace}
          languageId={languageId}
          link={link}
          state={initialState}
        />
      </div>
      <div className="col">
        Output
        <CodeState
          renderWhitespace={renderWhitespace}
          languageId={languageId}
          link={link}
          state={finalState}
        />
      </div>
    </div>
  );
}

function CodeState({
  renderWhitespace,
  languageId,
  link,
  state,
}: {
  renderWhitespace: boolean;
  languageId: string;
  link: {
    name: string;
    url: string;
  };
  state: TestCaseSnapshot;
}): JSX.Element {
  return (
    <Code
      link={link}
      languageId={languageId}
      renderWhitespace={renderWhitespace}
      // oxlint-disable-next-line react-perf/jsx-no-new-array-as-prop
      decorations={state.selections.map(toDecoration)}
    >
      {state.documentContents}
    </Code>
  );
}

function toDecoration(plainSelection: SelectionPlainObject): DecorationItem {
  const selection = plainObjectToSelection(plainSelection);

  if (selection.isEmpty) {
    return {
      start: selection.start,
      end: selection.start,
      properties: {
        className: ["code-cursor-before"],
      },
    };
  }

  const decoration = highlightToDecoration({
    range: selection,
    style: {
      backgroundColor: highlightColors.content.background,
      borderColorSolid: highlightColors.content.borderSolid,
      borderColorPorous: highlightColors.content.borderPorous,
      borderStyle: {
        top: BorderStyle.solid,
        bottom: BorderStyle.solid,
        left: BorderStyle.solid,
        right: BorderStyle.solid,
      },
      borderRadius: {
        topLeft: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
      },
    },
  });

  const className = selection.isReversed
    ? "code-cursor-before"
    : "code-cursor-after";

  return {
    ...decoration,
    properties: {
      ...decoration.properties,
      className: [className],
    },
  };
}

function useRecordedTestVisualizer(): RecordedTestVisualizerContextValue {
  const value = useContext(RecordedTestVisualizerContext);
  if (value == null) {
    throw new Error(
      "Recorded test visualizer components must be used within RecordedTestVisualizerProvider",
    );
  }
  return value;
}
