import { createHighlighter, createCssVariablesTheme } from "shiki";
import type { BundledLanguage } from "shiki";

import type {
  Command,
  CommandLatest,
  PlainSpyIDERecordedValues,
  TargetPlainObject,
  TestCaseFixture,
  TestCaseSnapshot
} from "@cursorless/common";

import { createDecorations } from "./helpers";
import type { DataFixture } from "./loadTestCaseFixture";

type Lang = BundledLanguage;

const myTheme = createCssVariablesTheme({
  name: "css-variables",
  variablePrefix: "--shiki-",
  variableDefaults: {},
  fontStyle: true,
});

/**
 * Generates HTML content based on the provided state, language, command, and ide.
 *
 * @param {DataFixture} data - The state object containing the necessary data for HTML generation.
 * @returns {Promise<string>} A promise that resolves to the generated HTML content.
 */
export async function generateHtml(data: DataFixture) {
  const HTMLOBject = await new HTMLGenerator(data)
  const returnObject = HTMLOBject.generateAll()
  return returnObject;
}

const highlighter = createHighlighter({
  themes: [myTheme],
  langs: ["javascript", "typescript"],
});

type StepNameType = "before" | "during" | "after"
type ExtendedTestCaseSnapshot = TestCaseSnapshot &
  Partial<PlainSpyIDERecordedValues> &
{
  finalStateMarkHelpers?: {
    thatMark?: TargetPlainObject[], sourceMark?: TargetPlainObject[]
  }
};

class HTMLGenerator {
  private testCaseStates: {
    before: ExtendedTestCaseSnapshot | undefined;
    during: ExtendedTestCaseSnapshot | undefined;
    after: ExtendedTestCaseSnapshot | undefined;
  }
  private lang: Lang;
  private command?: CommandLatest | Command;
  private raw: TestCaseFixture;
  private rendered: {
    before: string;
    during: string;
    after: string;
  }

  constructor(data: DataFixture) {
    const { languageId, command } = data;
    this.lang = languageId as BundledLanguage;
    this.command = command; // Optional command parameter
    this.raw = data
    this.rendered = {
      before: "",
      during: "",
      after: "",
    }
    this.testCaseStates = {
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
    }
  }

  async generate(stepName: StepNameType) {
    const state = this.testCaseStates[stepName]

    if (!state) {
      console.error(`Error in ${stepName} ${this.raw.command.spokenForm}`)
      return "Error"
    }

    const decorations = await this.getDecorations(state);

    const { documentContents } = state

    const htmlArray: string[] = []
    let codeBody;

    const errorLevels = [
      "excludes thatMarks sourceMarks selectionRanges ideFlashes",
      "excludes thatMarks sourceMarks selectionRanges",
      "excludes thatMarks sourceMarks",
      "excludes thatMarks",
      "success",
    ]

    let errorLevel = errorLevels.length - 1

    for (let i = decorations.length - 1; i >= 0; i--) {
      const fallbackDecoration = decorations.slice(0, i).flat();
      errorLevel = i
      try {
        const marker = await highlighter;
        const options = {
          theme: "css-variables",
          lang: this.lang,
          decorations: fallbackDecoration
        };
        codeBody = marker.codeToHtml(documentContents, options);
        htmlArray.push(codeBody)
        break; // Exit loop if successful
      } catch (error) {
        console.warn("Failed with decorations level:", fallbackDecoration, error);
        // Continue to the next fallback level
      }
    }

    if (!codeBody) {
      console.error("All fallback levels failed. Unable to generate code body.");
      codeBody = ""; // Provide a default empty string or handle as needed
    }

    let clipboardRendered = ""
    if (state.clipboard) {
      clipboardRendered = `<pre><code>clipboard: ${state.clipboard}</pre></code>`
      if (clipboardRendered !== "") {
        htmlArray.push(clipboardRendered)
      }
    }

    let error = ""
    if (errorLevel !== errorLevels.length - 1) {
      error = errorLevels[errorLevel]
      const errorRendered = `<pre><code>Omitted due to errors: ${error}</pre></code>`
      htmlArray.push(errorRendered)
    }
    return htmlArray.join("")
  }

  async generateAll() {

    const output = {
      before: await this.generate("before"),
      during: await this.generate("during"),
      after: await this.generate("after"),
    }
    return output
  }

  async getDecorations(testCaseState: ExtendedTestCaseSnapshot) {
    const { messages, flashes, highlights, finalStateMarkHelpers } = testCaseState

    const potentialMarks = testCaseState.marks || {}
    const lines = testCaseState.documentContents.split("\n")
    const obj = {
      marks: potentialMarks,
      ide: { messages, flashes, highlights },
      command: this.command,
      lines,
      selections: testCaseState.selections,
      thatMark: testCaseState.thatMark,
      sourceMark: testCaseState.sourceMark,
      finalStateMarkHelpers
    }

    const decorations = createDecorations(obj)
    return decorations
  }
}
