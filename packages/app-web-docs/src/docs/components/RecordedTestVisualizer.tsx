import { usePluginData } from "@docusaurus/useGlobalData";
import type { Dispatch, JSX, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { DecorationItem } from "shiki";
import type {
  Position,
  Range,
  Selection,
  TestCaseSnapshot,
} from "@cursorless/lib-common";
import {
  plainObjectToRange,
  plainObjectToSelection,
} from "@cursorless/lib-common";
import { Code } from "./Code";
import { highlightColors } from "./highlightColors";
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
    url: `https://github.com/cursorless-dev/cursorless/blob/main/resources/fixtures/recorded/${path}`,
  };

  const renderHats =
    fixture.initialState.marks != null &&
    Object.keys(fixture.initialState.marks).length > 0;

  return (
    <div className="row">
      <div className="col">
        Before
        <CodeState
          renderWhitespace={renderWhitespace}
          renderHats={renderHats}
          languageId={languageId}
          link={link}
          state={initialState}
        />
      </div>
      <div className="col">
        After
        <CodeState
          renderWhitespace={renderWhitespace}
          renderHats={renderHats}
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
  renderHats: boolean;
  languageId: string;
  link: {
    name: string;
    url: string;
  };
  state: TestCaseSnapshot;
}

function CodeState({
  renderWhitespace,
  renderHats,
  languageId,
  link,
  state,
}: CodeStateProps): JSX.Element {
  const decorations = useMemo(
    () => toDecorations(state, renderHats),
    [state, renderHats],
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

function toDecoration(selection: Selection): DecorationItem {
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

function toDecorations(
  state: TestCaseSnapshot,
  renderHats: boolean,
): DecorationItem[] {
  const selections = state.selections.map(plainObjectToSelection);
  const hatRanges = renderHats
    ? (state.hatTokenMap ?? []).map(({ hatRange }) =>
        plainObjectToRange(hatRange),
      )
    : [];
  const markRanges = renderHats
    ? Object.values(state.marks ?? {}).map(plainObjectToRange)
    : [];

  // Shiki rejects intersecting decorations. A zero-width cursor at the end of
  // a hat or mark range intersects that decoration, so render both on one
  // wrapper. We only merge at the end because code-cursor-after recreates that
  // exact boundary without competing with the hat's ::before pseudo-element.
  const mergedCursorPositions = selections
    .filter(
      (selection) =>
        selection.isEmpty &&
        [...hatRanges, ...markRanges].some(({ end }) =>
          end.isEqual(selection.active),
        ),
    )
    .map(({ active }) => active);

  return [
    // Omit cursors that the corresponding hat decoration will render instead.
    ...selections
      .filter(
        (selection) =>
          !selection.isEmpty ||
          !mergedCursorPositions.some((position) =>
            position.isEqual(selection.active),
          ),
      )
      .map(toDecoration),
    ...toMarkDecorations(markRanges, hatRanges, mergedCursorPositions),
    ...toHatDecorations(state, renderHats, mergedCursorPositions),
  ];
}

function toMarkDecorations(
  markRanges: readonly Range[],
  hatRanges: readonly Range[],
  mergedCursorPositions: readonly Position[],
): DecorationItem[] {
  return markRanges
    .filter(
      (range, index) =>
        markRanges.findIndex((otherRange) => otherRange.isRangeEqual(range)) ===
        index,
    )
    .map((range) => {
      const className = ["code-mark"];

      // Prefer placing the cursor on the smaller hat wrapper when both the hat
      // and its containing mark end at the cursor position.
      if (
        mergedCursorPositions.some((position) => position.isEqual(range.end)) &&
        !hatRanges.some(({ end }) => end.isEqual(range.end))
      ) {
        className.push("code-cursor-after");
      }

      return {
        start: range.start,
        end: range.end,
        alwaysWrap: true,
        properties: {
          className,
          style: `--code-mark-color: ${highlightColors.content.background};`,
        },
      };
    });
}

function toHatDecorations(
  state: TestCaseSnapshot,
  renderHats: boolean,
  mergedCursorPositions: readonly Position[],
): DecorationItem[] {
  if (!renderHats || state.hatTokenMap == null) {
    return [];
  }

  return state.hatTokenMap.map(({ hatStyle, hatRange }) => {
    const range = plainObjectToRange(hatRange);
    const properties: DecorationItem["properties"] = {
      className: ["code-hat", `code-hat-${hatStyle}`],
    };

    if (mergedCursorPositions.some((position) => position.isEqual(range.end))) {
      // The hat uses ::before and the cursor uses ::after, allowing both
      // visuals to share this wrapper without overlapping Shiki decorations.
      properties.className?.push("code-cursor-after");
    }

    return {
      start: hatRange.start,
      end: hatRange.end,
      alwaysWrap: true,
      properties,
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
