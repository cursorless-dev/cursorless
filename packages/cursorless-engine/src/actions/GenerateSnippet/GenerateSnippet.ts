import { FlashStyle, isTesting, Range } from "@cursorless/common";
import { ide } from "../../singletons/ide.singleton";
import { Target } from "../../typings/target.types";
import { matchAll } from "../../util/regex";
import { ensureSingleTarget, flashTargets } from "../../util/targetUtils";
import { ActionReturnValue } from "../actions.types";
import { constructSnippetBody } from "./constructSnippetBody";
import { editText } from "./editText";
import { openNewSnippetFile } from "./openNewSnippetFile";
import Substituter from "./Substituter";
import type { Offsets } from "../../typings/Types";

/**
 * This action can be used to automatically create a snippet from a target. Any
 * cursor selections inside the target will become placeholders in the final
 * snippet.  This action creates a new file, and inserts a snippet that the user
 * can fill out to construct their desired snippet.
 *
 * Note that there are two snippets involved in this implementation:
 *
 * - The snippet that the user is trying to create.  We refer to this snippet as
 *   the user snippet.
 * - The snippet that we insert that the user can use to build their snippet. We
 *   refer to this as the meta snippet.
 *
 * We proceed as follows:
 *
 * 1. Ask user for snippet name if not provided as arg
 * 2. Find all cursor selections inside target - these will become the user
 *    snippet variables
 * 3. Extract text of target
 * 4. Replace cursor selections in text with random ids that won't be affected
 *    by json serialization.  After serialization we'll replace these id's by
 *    snippet placeholders.
 * 4. Construct the user snippet body as a list of strings
 * 5. Construct a javascript object that will be json-ified to become the meta
 *    snippet
 * 6. Serialize the javascript object to json
 * 7. Perform replacements on the random id's appearing in this json to get the
 *    text we desire.  This modified json output is the meta snippet.
 * 8. Open a new document in user custom snippets dir to hold the new snippet.
 * 9. Insert the meta snippet so that the user can construct their snippet.
 *
 * Note that we avoid using JS interpolation strings here because the syntax is
 * very similar to snippet placeholders, so we would end up with lots of
 * confusing escaping.
 */
export default class GenerateSnippet {
  constructor() {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    snippetName?: string,
  ): Promise<ActionReturnValue> {
    const target = ensureSingleTarget(targets);
    const editor = target.editor;

    // NB: We don't await the pending edit decoration so that if the user
    // immediately starts saying the name of the snippet (eg command chain
    // "snippet make funk camel my function"), we're more likely to
    // win the race and have the input box ready for them
    flashTargets(ide(), targets, FlashStyle.referenced);

    if (snippetName == null) {
      snippetName = await ide().showInputBox({
        prompt: "Name of snippet",
        placeHolder: "helloWorld",
      });
    }

    // User cancelled; don't do anything
    if (snippetName == null) {
      return {};
    }

    /** The next placeholder index to use for the meta snippet */
    let currentPlaceholderIndex = 1;

    const baseOffset = editor.document.offsetAt(target.contentRange.start);

    /**
     * The variables that will appear in the user snippet. Note that
     * `placeholderIndex` here is the placeholder index in the meta snippet not
     * the user snippet.
     */
    const variables: Variable[] = editor.selections
      .filter((selection) => target.contentRange.contains(selection))
      .map((selection, index) => ({
        offsets: {
          start: editor.document.offsetAt(selection.start) - baseOffset,
          end: editor.document.offsetAt(selection.end) - baseOffset,
        },
        defaultName: `variable${index + 1}`,
        placeholderIndex: currentPlaceholderIndex++,
      }));

    /**
     * Constructs random ids that can be put into the text that won't be
     * modified by json serialization.
     */
    const substituter = new Substituter();

    /**
     * Text before the start of the snippet in the snippet start line.  We need
     * to pass this to {@link constructSnippetBody} so that it knows the
     * baseline indentation of the snippet
     */
    const linePrefix = editor.document.getText(
      new Range(
        target.contentRange.start.with(undefined, 0),
        target.contentRange.start,
      ),
    );

    const originalText = editor.document.getText(target.contentRange);

    /**
     * The text of the snippet, with placeholders inserted for variables and
     * special characters `$`, `\`, and `}` escaped twice to make it through
     * both meta snippet and user snippet.
     */
    const snippetBodyText = editText(originalText, [
      ...matchAll(originalText, /\$|\\/g, (match) => ({
        offsets: {
          start: match.index!,
          end: match.index! + match[0].length,
        },
        text: match[0] === "\\" ? `\\${match[0]}` : `\\\\${match[0]}`,
      })),
      ...variables.map(({ offsets, defaultName, placeholderIndex }) => ({
        offsets,
        // Note that the reason we use the substituter here is primarily so
        // that the `\` below doesn't get escaped upon conversion to json.
        text: substituter.addSubstitution(
          [
            // This `\$` will end up being a `$` in the final document.  It
            // indicates the start of a variable in the user snippet.  We need
            // the `\` so that the meta-snippet doesn't see it as one of its
            // placeholders.
            "\\$",

            // The remaining text here is a placeholder in the meta-snippet
            // that the user can use to name their snippet variable that will
            // be in the user snippet.
            "${",
            placeholderIndex,
            ":",
            defaultName,
            "}",
          ].join(""),
        ),
      })),
    ]);

    const snippetLines = constructSnippetBody(snippetBodyText, linePrefix);

    /**
     * Constructs a key-value entry for use in the variable description section
     * of the user snippet definition.  It contains tabstops for use in the
     * meta-snippet.
     * @param variable The variable
     * @returns A [key, value] pair for use in the meta-snippet
     */
    const constructVariableDescriptionEntry = ({
      placeholderIndex,
    }: Variable): [string, string] => {
      // The key will have the same placeholder index as the other location
      // where this variable appears.
      const key = "$" + placeholderIndex;

      // The value will end up being an empty object with a tabstop in the
      // middle so that the user can add information about the variable, such
      // as wrapperScopeType.  Ie the output will look like `{|}` (with the `|`
      // representing a tabstop in the meta-snippet)
      //
      // NB: We use the substituter here, with `isQuoted=true` because in order
      // to make this work for the meta-snippet, we want to end up with
      // something like `{$3}`, which is not valid json.  So we instead arrange
      // to end up with json like `"hgidfsivhs"`, and then replace the whole
      // string (including quotes) with `{$3}` after json-ification
      const value = substituter.addSubstitution(
        "{$" + currentPlaceholderIndex++ + "}",
        true,
      );

      return [key, value];
    };

    /** An object that will be json-ified to become the meta-snippet */
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
        description: "$" + currentPlaceholderIndex++,
        variables:
          variables.length === 0
            ? undefined
            : Object.fromEntries(
                variables.map(constructVariableDescriptionEntry),
              ),
      },
    };

    /**
     * This is the text of the meta-snippet in Textmate format that we will
     * insert into the new document where the user will fill out their snippet
     * definition
     */
    const snippetText = substituter.makeSubstitutions(
      JSON.stringify(snippet, null, 2),
    );

    const editableEditor = ide().getEditableTextEditor(editor);

    if (isTesting()) {
      // If we're testing, we just overwrite the current document
      editableEditor.selections = [editor.document.range.toSelection(false)];
    } else {
      // Otherwise, we create and open a new document for the snippet in the
      // user snippets dir
      await openNewSnippetFile(snippetName);
    }

    // Insert the meta-snippet
    await editableEditor.insertSnippet(snippetText);

    return {
      thatSelections: targets.map(({ editor, contentSelection }) => ({
        editor,
        selection: contentSelection,
      })),
    };
  }
}

interface Variable {
  /**
   * The start an end offsets of the variable relative to the text of the
   * snippet that contains it
   */
  offsets: Offsets;

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
