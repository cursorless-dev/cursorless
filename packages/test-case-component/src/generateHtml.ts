import { createHighlighter, createCssVariablesTheme } from "shiki";
import type { BundledLanguage } from "shiki";

import type { TargetPlainObject, TestCaseSnapshot } from "@cursorless/common";

import { createDecorations } from "./helpers";

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
 * @param {TestCaseSnapshot} state - The state object containing the necessary data for HTML generation.
 * @param {Lang} lang - The language object specifying the language for the HTML content.
 * @param {any} [command] - (Optional) The command object specifying the command details.
 * @param {any} [ide] - (Optional) The ide object specifying the IDE details.
 * @returns {Promise<string>} A promise that resolves to the generated HTML content.
 */
export async function generateHtml({
  stateName,
  state,
  languageId: lang,
  command,
  ide,
  raw
}: {
  stateName: string;
  state: TestCaseSnapshot;
  languageId: BundledLanguage;
  command?: any; // Replace `any` with the appropriate type if with
  ide?: any; // Replace `any` with the appropriate type if known
  raw: any;
}) {
  return new HTMLGenerator({ state, lang, command, ide, raw }).generate();
}

const highlighter = createHighlighter({
  themes: [myTheme],
  langs: ["javascript", "typescript"],
});

class HTMLGenerator {
  private state: TestCaseSnapshot;
  private lang: Lang;
  private command?: any;
  private ide?: any;
  private raw: any;

  constructor({
    state,
    lang,
    command,
    ide,
    raw
  }: {
    state: TestCaseSnapshot,
    lang: Lang,
    command?: any,
    ide?: any,
    raw?: any
  }) {
    this.state = state;
    this.lang = lang;
    this.command = command; // Optional command parameter
    this.ide = ide;         // Optional ide parameter
    this.raw = raw
  }


  async generate() {
    const decorations = await this.getDecorations();
    const options = {
      theme: "css-variables",
      lang: this.lang,
      decorations
    };

    const marker = await highlighter
    const codeBody = marker.codeToHtml(this.state.documentContents, options)
    let clipboard = ""
    if (this.state.clipboard) {
      clipboard = `<pre><code>clipboard: ${this.state.clipboard}</pre></code>`
    }
    const output = clipboard !== "" ? codeBody + clipboard : codeBody
    return output
  }

  async getDecorations() {
    const potentialMarks = this.state.marks || {}
    const lines = this.state.documentContents.split("\n")
    console.log("💎", this.state.thatMark)
    const decorations = createDecorations({
      marks: potentialMarks,
      ide: this.ide,
      command: this.command,
      lines,
      selections: this.state.selections,
      thatMark: this.state.thatMark
    })
    return decorations
  }
}
