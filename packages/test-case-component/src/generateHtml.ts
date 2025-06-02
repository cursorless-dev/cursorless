import { createHighlighter } from "./createHighlighter";
import type { BundledLanguage, DecorationItem } from "shiki";
import type { StepNameType, ExtendedTestCaseSnapshot, DataFixture } from "./types";
import type { Command } from "@cursorless/common";

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

/**
 * Renders the clipboard HTML if clipboard content exists.
 *
 * @param {string | undefined} clipboard - The clipboard string or undefined.
 * @returns {string} The HTML string for the clipboard, or an empty string if clipboard is undefined.
 */
function renderClipboard(clipboard: string | undefined): string {
  if (!clipboard) {
    return "";
  }
  return `<pre><code>clipboard: ${clipboard}</pre></code>`;
}

/**
 * Renders the error HTML if an error occurred.
 *
 * @param {number} errorLevel - The error level index.
 * @param {string[]} errorLevels - The array of error level descriptions.
 * @returns {string} The HTML string for the error, or an empty string if no error.
 */
function renderError(errorLevel: number, errorLevels: string[]): string {
  if (errorLevel === errorLevels.length - 1) {
    return "";
  }
  const error = errorLevels[errorLevel];
  return `<pre><code>Omitted due to errors: ${error}</pre></code>`;
}

/**
 * Computes code decorations for a given test case state.
 *
 * @param {ExtendedTestCaseSnapshot} testCaseState - The test case state to decorate.
 * @param {Command} command - The command object for the test case.
 * @returns {Promise<DecorationItem[][]>} The computed decorations for the state.
 */
async function getDecorations(
  testCaseState: ExtendedTestCaseSnapshot,
  command: Command
): Promise<DecorationItem[][]> {
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

/**
 * Closure-based HTML generator for test case data.
 *
 * @param {DataFixture} data - The state object containing the necessary data for HTML generation.
 * @returns {Object} An object with generate, generateAll, and getDecorations async functions.
 */
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

  /**
   * Generates HTML for a specific test case step (before, during, after).
   *
   * @param {StepNameType} stepName - The step to generate HTML for.
   * @returns {Promise<{ html: string; data: any[] } | string>} The generated HTML and decoration data, or an error string.
   */
  async function generate(stepName: StepNameType) {
    const state = testCaseStates[stepName];
    if (!state) {
      console.error(`Error in ${stepName} ${raw.command.spokenForm}`);
      return "Error";
    }
    const decorations = await getDecorations(state, command);
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
        const marker = await createHighlighter();
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

    const clipboardRendered = renderClipboard(state.clipboard);
    if (clipboardRendered !== "") {
      htmlArray.push(clipboardRendered);
    }

    const errorRendered = renderError(errorLevel, errorLevels);
    if (errorRendered !== "") {
      htmlArray.push(errorRendered);
    }

    return { html: htmlArray.join(""), data: [decorations] };
  }

  /**
   * Generates HTML for all test case steps (before, during, after).
   *
   * @returns {Promise<{ before: string; during: string; after: string }>} The generated HTML and decoration data for each step.
   */
  async function generateAll() {
    return {
      before: await generate("before"),
      during: await generate("during"),
      after: await generate("after"),
    };
  }

  return { generate, generateAll };
}
