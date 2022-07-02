import { range, repeat } from "lodash";
import { Range, TextEditor } from "vscode";

/**
 * Converts a range of text in an editor into a snippet body representation as
 * expected by textmate.
 *
 * Note that if you want tabstops, you must first directly modify the editor to
 * contain tabstops and then reset it afterwards.  Also note that in order to
 * avoid extra escaping of eg slashes, you need to do so using something like
 * {@link Substituter}.
 *
 * NB: We operate on a range here instead of just getting the text for a few reasons:
 *
 * - We want to be able to see the entire first line so that we know the indentation of the first lines
 * - We let vscode normalize line endings
 * - We let vscode figure out where line content starts
 *
 * None of these are insurmountable obstacles if we switched to just operating
 * on text, so we should probably do that in the future to avoid needing to
 * manipulate the editor before running this function.
 *
 * @param editor The editor containing {@param snippetRange}
 * @param snippetRange The range of text in the editor to convert to a snippet
 * @returns The body of a snippet represented as a list of lines as expected for
 * textmate snippets
 */
export function constructSnippetBody(
  editor: TextEditor,
  snippetRange: Range
): string[] {
  const snippetLines: string[] = [];
  let currentTabCount = 0;
  let currentIndentationString: string | null = null;

  const { start, end } = snippetRange;
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

  return snippetLines;
}
