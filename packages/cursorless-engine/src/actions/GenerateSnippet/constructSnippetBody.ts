import { repeat } from "lodash-es";

interface Line {
  /**
   * The text of the line
   */
  text: string;

  /**
   * The index at which the snippet starts on this line.  Will be 0 for all but
   * the first line.  For the first line it will be set so that the first line
   * can be the actual document line containing the start of the snippet, for
   * use with indentation, but we set startIndex so that we only use the
   * content from where the snippet starts.
   */
  startIndex: number;
}

/**
 * Converts a range of text in an editor into a snippet body representation as
 * expected by textmate.
 *
 * Note that if you want tabstops, you must first modify {@link text} to
 * contain the tabstops.
 *
 * @param text The text to use for the snippet body
 * @param linePrefix The text on the line that the snippet starts on leading to
 * the start of the snippet. This is used for determining indentation
 * @returns The body of a snippet represented as a list of lines as expected for
 * textmate snippets
 */
export function constructSnippetBody(
  text: string,
  linePrefix: string,
): string[] {
  const outputLines: string[] = [];
  let currentTabCount = 0;
  let currentIndentationString: string | null = null;

  const [firstLine, ...remainingLines] = text.split(/\r?\n/);
  const lines: Line[] = [
    {
      text: linePrefix + firstLine,
      startIndex: linePrefix.length,
    },
    ...remainingLines.map((line) => ({ text: line, startIndex: 0 })),
  ];

  lines.forEach(({ text, startIndex }) => {
    const newIndentationString = text.match(/^\s*/)?.[0] ?? "";
    const firstNonWhitespaceCharacterIndex = newIndentationString.length;

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
      startIndex,
    );
    const snippetIndentationString = repeat("\t", currentTabCount);
    const lineContent = text.slice(lineContentStart);

    outputLines.push(snippetIndentationString + lineContent);
  });

  return outputLines;
}
