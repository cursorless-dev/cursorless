import { createHighlighter } from "./createHighlighter";
import type { BundledLanguage } from "shiki";
import type { StepNameType, DataFixture } from "./types";

import { renderClipboard, renderError } from "./renderHtml";
import { getDecorations } from "./helpers/decorations";

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
