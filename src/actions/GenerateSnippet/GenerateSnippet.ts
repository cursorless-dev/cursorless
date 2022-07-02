import { range, zip } from "lodash";
import { ensureSingleTarget } from "../../util/targetUtils";

import { open } from "fs/promises";
import { join } from "path";
import { commands, window, workspace } from "vscode";
import { performEditsAndUpdateSelections } from "../../core/updateSelections/updateSelections";
import { Target } from "../../typings/target.types";
import { Graph } from "../../typings/Types";
import { performDocumentEdits } from "../../util/performDocumentEdits";
import { Action, ActionReturnValue } from "../actions.types";
import Substituter from "./Substituter";
import { constructSnippetBody } from "./constructSnippetBody";

interface Variable {
  /**
   * The default name for the given variable that will appear as the placeholder
   * text in the meta snippet
   */
  defaultName: string;

  /**
   * The placeholder to use when filling out the name of this variable in the
   * meta snippet.
   */
  placeholderIndex: number;
}

/**
 * This action can be used to automatically create a snippet from a target.
 * Any cursor selections inside the target will become placeholders in the final
 * snippet.  This action creates a new file, and inserts a snippet that the
 * user can fill out to construct their desired snippet.
 *
 * Note that there are two snippets involved in this implementation:
 *
 * - The snippet that the user is trying to create.  We refer to this snippet as the user snippet.
 * - The snippet that we insert that the user can use to build their snippet.
 * We refer to this as the meta snippet.
 *
 * We proceed as follows:
 *
 * 1. Ask user for snippet name if not provided as arg
 * 2. Find all cursor selections inside target
 * 3. Replace cursor selections in document with random ids that won't be
 * affected by json serialization.  After serialization we'll replace these
 * id's by snippet placeholders.  Note that this modifies the document, so we
 * need to reset later.
 * 4. Construct a snippet body as a list of strings
 * 5. Construct a snippet as a javascript object
 * 6. Serialize the javascript object to json
 * 7. Perform replacements on the random id's appearing in this json to get the
 * text we desire.  This modified json output is the meta snippet.
 * 8. Insert the meta snippet so that the user can construct their snippet.
 */
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

    // User cancelled; don't do anything
    if (snippetName == null) {
      return {};
    }

    /** The next placeholder index to use for the meta snippet */
    let nextPlaceholderIndex = 1;

    /**
     * The original selections and the editor that will become variables in the
     * user snippet
     */
    const originalVariableSelections = editor.selections.filter((selection) =>
      target.contentRange.contains(selection)
    );

    /**
     * The original text of the selections where the variables were in the
     * document to use to restore the document contents when we're done.
     */
    const originalVariableTexts = originalVariableSelections.map((selection) =>
      editor.document.getText(selection)
    );

    /**
     * The variables that will appear in the user snippet. Note that
     * `placeholderIndex` here is the placeholder index in the meta snippet not
     * the user snippet.
     */
    const variables: Variable[] = range(originalVariableSelections.length).map(
      (index) => ({
        defaultName: `variable${index + 1}`,
        placeholderIndex: nextPlaceholderIndex++,
      })
    );

    /**
     * Constructs random ids that can be put into the text that won't be
     * modified by json serialization.
     */
    const substituter = new Substituter();

    const [variableSelections, [targetSelection]] =
      await performEditsAndUpdateSelections(
        this.graph.rangeUpdater,
        editor,
        originalVariableSelections.map((selection, index) => ({
          editor,
          range: selection,
          text: substituter.addSubstitution(
            [
              "\\$${",
              variables[index].placeholderIndex,
              ":",
              variables[index].defaultName,
              "}",
            ].join("")
          ),
        })),
        [originalVariableSelections, [target.contentSelection]]
      );

    const snippetLines = constructSnippetBody(editor, targetSelection);

    await performDocumentEdits(
      this.graph.rangeUpdater,
      editor,
      zip(variableSelections, originalVariableTexts).map(([range, text]) => ({
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
        description: `$${nextPlaceholderIndex++}`,
        variables:
          originalVariableSelections.length === 0
            ? undefined
            : Object.fromEntries(
                range(originalVariableSelections.length).map((index) => [
                  `$${variables[index].placeholderIndex}`,
                  substituter.addSubstitution(
                    `{$${nextPlaceholderIndex++}}`,
                    true
                  ),
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

async function touch(path: string) {
  const file = await open(path, "w");
  await file.close();
}
