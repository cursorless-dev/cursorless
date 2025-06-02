import { createHighlighter } from "./createHighlighter";
import type { BundledLanguage } from "shiki";
import type { StepNameType, ExtendedTestCaseSnapshot, DataFixture } from "./types";

import { createDecorations } from "./helpers";

/**
 * Generates HTML content based on the provided state, language, command, and ide.
 *
 * @param {DataFixture} data - The state object containing the necessary data for HTML generation.
 * @returns {Promise<{ before: string; during: string; after: string }>} A promise that resolves to the generated HTML content for each step.
 */
export async function generateHtml(data: DataFixture) {
  return createHtmlGenerator(data).generateAll();
}

const highlighter = createHighlighter();

function createHtmlGenerator(data: DataFixture) {
  const lang = data.languageId as BundledLanguage;
  const command = data.command;
  const raw = data;
  const testCaseStates = {
    before: data.initialState,
    during: {
      ...(
        /**
         * Spread the document state with more lines (finalState vs initialState),
         * so Shiki decorations stay in bounds and don't go out of range.
         */
        data.finalState &&
          (data.finalState.documentContents?.split("\n").length > data.initialState.documentContents?.split("\n").length)
          ? data.finalState
          : data.initialState
      ),
      ...data.ide,
      finalStateMarkHelpers: {
        thatMark: data?.finalState?.thatMark,
        sourceMark: data?.finalState?.sourceMark
      }
    },
    after: data.finalState
  };

  async function generate(stepName: StepNameType) {
    const state = testCaseStates[stepName];
    if (!state) {
      console.error(`Error in ${stepName} ${raw.command.spokenForm}`);
      return "Error";
    }
    const decorations = await getDecorations(state);
    const { documentContents } = state;
    const htmlArray: string[] = [];
    let codeBody;
    const errorLevels = [
      "excludes thatMarks sourceMarks selectionRanges ideFlashes",
      "excludes thatMarks sourceMarks selectionRanges",
      "excludes thatMarks sourceMarks",
      "excludes thatMarks",
      "success",
    ];
    let errorLevel = errorLevels.length - 1;
    for (let i = decorations.length - 1; i >= 0; i--) {
      const fallbackDecoration = decorations.slice(0, i).flat();
      errorLevel = i;
      try {
        const marker = await highlighter;
        const options = {
          theme: "css-variables",
          lang,
          decorations: fallbackDecoration
        };
        codeBody = marker.codeToHtml(documentContents, options);
        htmlArray.push(codeBody);
        break;
      } catch (error) {
        console.warn(`"Failed with decorations level ${i}:"`, command);
        console.warn(fallbackDecoration, error);
      }
    }
    if (!codeBody) {
      console.error("All fallback levels failed. Unable to generate code body.");
      codeBody = "";
    }
    let clipboardRendered = "";
    if (state.clipboard) {
      clipboardRendered = `<pre><code>clipboard: ${state.clipboard}</pre></code>`;
      if (clipboardRendered !== "") {
        htmlArray.push(clipboardRendered);
      }
    }
    let error = "";
    if (errorLevel !== errorLevels.length - 1) {
      error = errorLevels[errorLevel];
      const errorRendered = `<pre><code>Omitted due to errors: ${error}</pre></code>`;
      htmlArray.push(errorRendered);
    }
    return { html: htmlArray.join(""), data: [decorations] };
  }

  async function generateAll() {
    return {
      before: await generate("before"),
      during: await generate("during"),
      after: await generate("after"),
    };
  }

  async function getDecorations(testCaseState: ExtendedTestCaseSnapshot) {
    const { messages, flashes, highlights, finalStateMarkHelpers } = testCaseState;
    const potentialMarks = testCaseState.marks || {};
    const lines = testCaseState.documentContents.split("\n");
    const obj = {
      marks: potentialMarks,
      ide: { messages, flashes, highlights },
      command,
      lines,
      selections: testCaseState.selections,
      thatMark: testCaseState.thatMark,
      sourceMark: testCaseState.sourceMark,
      finalStateMarkHelpers
    };
    const decorations = createDecorations(obj);
    return decorations;
  }

  return { generate, generateAll, getDecorations };
}
