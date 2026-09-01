import { usePluginData } from "@docusaurus/useGlobalData";
import type { Dispatch, JSX, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { DecorationItem } from "shiki";
import type {
  SelectionPlainObject,
  SerializedMarks,
  TestCaseSnapshot,
} from "@cursorless/lib-common";
import { plainObjectToSelection, splitKey } from "@cursorless/lib-common";
import { Code } from "./Code";
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

interface RecordedTestVisualizerProps {
  fixtureName: string;
}

export function RecordedTestVisualizer({
  fixtureName,
}: RecordedTestVisualizerProps): JSX.Element {
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

interface CodeStateProps {
  renderWhitespace: boolean;
  languageId: string;
  link: {
    name: string;
    url: string;
  };
  state: TestCaseSnapshot;
}

function CodeState({
  renderWhitespace,
  languageId,
  link,
  state,
}: CodeStateProps): JSX.Element {
  const decorations = useMemo(
    () => [
      ...state.selections.map(toDecoration),
      ...toMarkDecorations(state.marks, state.documentContents),
    ],
    [state.selections, state.marks, state.documentContents],
  );
  return (
    <>
      <Code
        link={link}
        languageId={languageId}
        renderWhitespace={renderWhitespace}
        decorations={decorations}
      >
        {state.documentContents}
      </Code>

      {state.clipboard != null && (
        <div className="mt-2">
          <strong>Clipboard:</strong>
          &nbsp;<i>&quot;{state.clipboard}&quot;</i>
        </div>
      )}
    </>
  );
}

function toDecoration(plainSelection: SelectionPlainObject): DecorationItem {
  const selection = plainObjectToSelection(plainSelection);

  const cursorClassName = selection.isReversed
    ? "code-cursor-before"
    : "code-cursor-after";

  const classNames = selection.isEmpty
    ? [cursorClassName]
    : [cursorClassName, "code-selection"];

  return {
    start: selection.start,
    end: selection.end,
    alwaysWrap: true,
    properties: {
      className: classNames,
    },
  };
}

/**
 * Converts serialized token marks to Shiki decorations around the first
 * occurrence of each mark's decorated character within its token.
 */
function toMarkDecorations(
  marks: SerializedMarks | undefined,
  documentContents: string,
): DecorationItem[] {
  if (marks == null) {
    return [];
  }

  const lines = documentContents.split(/\r?\n/u);

  return Object.entries(marks).map(([key, range]) => {
    if (range.start.line !== range.end.line) {
      throw new Error(`Mark ${key} spans multiple lines`);
    }

    const line = lines[range.start.line];

    if (line == null) {
      throw new Error(`Mark ${key} is outside the document`);
    }

    const { hatStyle, character } = splitKey(key);
    const tokenText = line.slice(range.start.character, range.end.character);
    const characterOffset = tokenText.indexOf(character);
    const characterStart = range.start.character + characterOffset;

    if (characterOffset === -1) {
      throw new Error(`Mark ${key} does not occur in its token`);
    }

    return {
      start: { line: range.start.line, character: characterStart },
      end: {
        line: range.start.line,
        character: characterStart + character.length,
      },
      alwaysWrap: true,
      properties: {
        className: ["code-hat", `code-hat-${hatStyle}`],
      },
    };
  });
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
