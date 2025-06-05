import { createHighlighter } from "./createHighlighter";
import type { BundledLanguage } from "shiki";
import type { StepNameType, DataFixture } from "./types";
import type { ExtendedTestCaseSnapshot } from "./types";

import { renderClipboard } from "./renderHtml";
import { getDecorations } from "./helpers/decorations";

/**
 * Generates HTML content based on the provided state, language, command, and ide.
 *
 * @param {DataFixture} data - The state object containing the necessary data for HTML generation.
 * @returns {Promise<{ before: string; during: string; after: string }>} A promise that resolves to the generated HTML content for each step.
 */
export async function generateHtml(data: DataFixture, debug = false) {
  return createHtmlGenerator(data, debug).generateAll();
}

/**
 * Closure-based HTML generator for test case data.
 *
 * @param {DataFixture} data - The state object containing the necessary data for HTML generation.
 * @returns {Object} An object with generate, generateAll, and getDecorations async functions.
 */
function createHtmlGenerator(data: DataFixture, debug = false) {
  const lang = data.languageId as BundledLanguage;
  const command = data.command;
  const raw = data;
  const testCaseStates = {
    before: data.initialState,
    during: getDuringSnapshot(data),
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
      if (debug) { console.error(`Error in ${stepName} ${raw.command.spokenForm}`); }
      return "Error";
    }
    const extendedState = { ...state, stepName };
    const decorations = await getDecorations({ snapshot: extendedState, command });
    const { documentContents } = state;
    const htmlArray: string[] = [];
    let codeBody;
    // Simplified: just try rendering once with all decorations
    try {
      const marker = await createHighlighter();
      const options = {
        theme: "css-variables",
        lang,
        decorations,
      };
      codeBody = marker.codeToHtml(documentContents, options);
      htmlArray.push(codeBody);
    } catch (error) {
      if (debug) { console.error("Failed to generate code body:", error); }
      codeBody = "";
    }

    const clipboardRendered = renderClipboard(state.clipboard);
    if (clipboardRendered !== "") {
      htmlArray.push(clipboardRendered);
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

/**
 * Selects the appropriate snapshot for the "during" step of a test case.
 * If the final state has more lines than the initial state, it uses the final state as the base;
 * otherwise, it uses the initial state. It then merges in IDE state and final mark helpers.
 *
 * @param {DataFixture} data - The test case data containing initialState, finalState, and ide info.
 * @returns {ExtendedTestCaseSnapshot} The snapshot to use for the "during" step.
 */
function getDuringSnapshot(data: DataFixture): ExtendedTestCaseSnapshot {
  // Spread the document state with more lines (finalState vs initialState),
  // so Shiki decorations stay in bounds and don't go out of range.
  const base =
    data.finalState &&
      (data.finalState.documentContents?.split("\n").length > data.initialState.documentContents?.split("\n").length)
      ? data.finalState
      : data.initialState;
  // Exclude sourceMark and thatMark from the DURING snapshot
  const { sourceMark, thatMark, ...restBase } = base;
  return {
    ...restBase,
    ...data.ide,
    stepName: "during",
  };
}
