import { range, repeat, zip } from "lodash";
import { ensureSingleTarget } from "../util/targetUtils";

import { open } from "fs/promises";
import { join } from "path";
import { commands, window, workspace } from "vscode";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { performDocumentEdits } from "../util/performDocumentEdits";
import { Action, ActionReturnValue } from "./actions.types";

export default class GenerateSnippet implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    snippetName?: string
  ): Promise<ActionReturnValue> {
    const target = ensureSingleTarget(targets);
    const editor = target.editor;

    // NB: We don't await the pending edit decoration so that if they
    // immediately start saying the name of the snippet, we're more likely to
    // win the race and have the input box ready for them
    this.graph.editStyles.displayPendingEditDecorations(
      targets,
      this.graph.editStyles.referenced
    );

    if (snippetName == null) {
      snippetName = await window.showInputBox({
        prompt: "Name of snippet",
        placeHolder: "helloWorld",
      });
    }

    if (snippetName == null) {
      return {};
    }

    let placeholderIndex = 1;

    const originalSelections = editor.selections.filter(
      (selection) =>
        !selection.isEmpty && target.contentRange.contains(selection)
    );
    const originalSelectionTexts = originalSelections.map((selection) =>
      editor.document.getText(selection)
    );

    const variables = range(originalSelections.length).map((index) => ({
      value: `variable${index + 1}`,
      index: placeholderIndex++,
    }));

    const substituter = new Substituter();

    const [placeholderRanges, [targetSelection]] =
      await performEditsAndUpdateSelections(
        this.graph.rangeUpdater,
        editor,
        originalSelections.map((selection, index) => ({
          editor,
          range: selection,
          text: substituter.addSubstitution(
            `\\$\${${variables[index].index}:${variables[index].value}}`
          ),
        })),
        [originalSelections, [target.contentSelection]]
      );

    const snippetLines: string[] = [];
    let currentTabCount = 0;
    let currentIndentationString: string | null = null;

    const { start, end } = targetSelection;
    const startLine = start.line;
    const endLine = end.line;
    range(startLine, endLine + 1).forEach((lineNumber) => {
      const line = editor.document.lineAt(lineNumber);
      const { text, firstNonWhitespaceCharacterIndex } = line;
      const newIndentationString = text.substring(
        0,
        firstNonWhitespaceCharacterIndex
      );

      if (currentIndentationString != null) {
        if (newIndentationString.length > currentIndentationString.length) {
          currentTabCount++;
        } else if (
          newIndentationString.length < currentIndentationString.length
        ) {
          currentTabCount--;
        }
      }

      currentIndentationString = newIndentationString;

      const lineContentStart = Math.max(
        firstNonWhitespaceCharacterIndex,
        lineNumber === startLine ? start.character : 0
      );
      const lineContentEnd = Math.min(
        text.length,
        lineNumber === endLine ? end.character : Infinity
      );
      const snippetIndentationString = repeat("\t", currentTabCount);
      const lineContent = text.substring(lineContentStart, lineContentEnd);
      snippetLines.push(snippetIndentationString + lineContent);
    });

    await performDocumentEdits(
      this.graph.rangeUpdater,
      editor,
      zip(placeholderRanges, originalSelectionTexts).map(([range, text]) => ({
        editor,
        range: range!,
        text: text!,
      }))
    );

    const snippet = {
      [snippetName]: {
        definitions: [
          {
            scope: {
              langIds: [editor.document.languageId],
            },
            body: snippetLines,
          },
        ],
        description: `$${placeholderIndex++}`,
        variables:
          originalSelections.length === 0
            ? undefined
            : Object.fromEntries(
                range(originalSelections.length).map((index) => [
                  `$${variables[index].index}`,
                  substituter.addSubstitution(`{$${placeholderIndex++}}`, true),
                ])
              ),
      },
    };
    const snippetText = substituter.makeSubstitutions(
      JSON.stringify(snippet, null, 2)
    );
    console.debug(snippetText);

    const userSnippetsDir = workspace
      .getConfiguration("cursorless.experimental")
      .get<string>("snippetsDir");

    if (!userSnippetsDir) {
      throw new Error("User snippets dir not configured.");
    }

    const path = join(userSnippetsDir, `${snippetName}.cursorless-snippets`);
    await touch(path);
    const snippetDoc = await workspace.openTextDocument(path);
    await window.showTextDocument(snippetDoc);

    commands.executeCommand("editor.action.insertSnippet", {
      snippet: snippetText,
    });

    return {
      thatMark: targets.map(({ editor, contentSelection }) => ({
        editor,
        selection: contentSelection,
      })),
    };
  }
}

interface Substitution {
  randomId: string;
  to: string;
  isQuoted: boolean;
}

class Substituter {
  private substitutions: Substitution[] = [];

  addSubstitution(to: string, isQuoted: boolean = false) {
    const randomId = makeid(10);

    this.substitutions.push({
      to,
      randomId,
      isQuoted,
    });

    return randomId;
  }

  makeSubstitutions(text: string) {
    this.substitutions.forEach(({ to, randomId, isQuoted }) => {
      const from = isQuoted ? `"${randomId}"` : randomId;
      // NB: We use split / join instead of replace because the latter doesn't
      // handle dollar signs well
      text = text.split(from).join(to);
    });

    return text;
  }
}

// From https://stackoverflow.com/a/1349426/2605678
function makeid(length: number) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function touch(path: string) {
  const file = await open(path, "w");
  await file.close();
}
