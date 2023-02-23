import { Range, TextEditor } from "@cursorless/common";
import { imap } from "itertools";
import { matchAll } from "./regex";
import type { Direction } from "@cursorless/common";

export function getMatchesInRange(
  regex: RegExp,
  editor: TextEditor,
  range: Range,
): Range[] {
  const offset = editor.document.offsetAt(range.start);
  const text = editor.document.getText(range);

  return matchAll(
    text,
    regex,
    (match) =>
      new Range(
        editor.document.positionAt(offset + match.index!),
        editor.document.positionAt(offset + match.index! + match[0].length),
      ),
  );
}

export function generateMatchesInRange(
  regex: RegExp,
  editor: TextEditor,
  range: Range,
  direction: Direction,
): Iterable<Range> {
  const offset = editor.document.offsetAt(range.start);
  const text = editor.document.getText(range);

  const matchToRange = (match: RegExpMatchArray): Range =>
    new Range(
      editor.document.positionAt(offset + match.index!),
      editor.document.positionAt(offset + match.index! + match[0].length),
    );

  // Reset the regex to start at the beginning of string, in case the regex has
  // been used before.
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
  regex.lastIndex = 0;

  return direction === "forward"
    ? imap(text.matchAll(regex), matchToRange)
    : Array.from(text.matchAll(regex), matchToRange).reverse();
}
