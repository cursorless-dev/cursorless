import { Range, TextEditor } from "vscode";

/**
 * Takes the range for a collection and returns a list of tokens within that collection
 * @param editor The editor containing the range
 * @param interior The range to look for tokens within
 * @param boundary Optional boundaries for collections. [], {}
 * @returns List of tokens
 */
export function tokenizeRange(
  editor: TextEditor,
  interior: Range,
  boundary?: [Range, Range]
): Token[] {
  const { document } = editor;
  const text = document.getText(interior);
  /**
   * The interior range tokenized into delimited regions, including the delimiters themselves.  For example:
   * `"foo(hello), bar, whatever"` =>
   * `["foo", "(", "hello", ")", ",", " bar", ",", " whatever"]`
   */
  const lexemes = text
    // NB: Both the delimiters and the text between them are included because we
    // use a capture group in this split regex
    .split(/([,(){}<>[\]"'`]|\\"|\\'|\\`)/g)
    .filter((lexeme) => lexeme.length > 0);
  const joinedLexemes = joinLexemesBySkippingMatchingPairs(lexemes);
  const tokens: Token[] = [];
  let offset = document.offsetAt(interior.start);

  joinedLexemes.forEach((lexeme) => {
    // Whitespace found. Just skip
    if (lexeme.trim().length === 0) {
      offset += lexeme.length;
      return;
    }

    // Separator delimiter found.
    if (lexeme === separator) {
      tokens.push({
        type: "separator",
        range: new Range(
          document.positionAt(offset),
          document.positionAt(offset + lexeme.length)
        ),
      });
    }

    // Text/item content found
    else {
      const offsetStart = offset + (lexeme.length - lexeme.trimStart().length);
      tokens.push({
        type: "item",
        range: new Range(
          document.positionAt(offsetStart),
          document.positionAt(offsetStart + lexeme.trim().length)
        ),
      });
    }

    offset += lexeme.length;
  });

  if (boundary != null) {
    return [
      { type: "boundary", range: boundary[0] },
      ...tokens,
      { type: "boundary", range: boundary[1] },
    ];
  }

  return tokens;
}

/**
 * Takes a list of lexemes and joins them by skipping matching pairs (), {}, etc
 * @param lexemes List of lexemes to operate on
 * @returns List of lexemes with equal or less length then {@link lexemes}
 */
export function joinLexemesBySkippingMatchingPairs(lexemes: string[]) {
  const result: string[] = [];
  /**
   * The number of left delimiters minus right delimiters we've seen.  If the
   * balance is 0, we're at the top level of the collection, so separators are
   * relevant.  Otherwise we ignore separators because they're nested
   */
  let delimiterBalance = 0;
  /** The most recent opening delimiter we've seen */
  let openingDelimiter: string | null = null;
  /** The closing delimiter we're currently looking for */
  let closingDelimiter: string | null = null;
  /**
   * The index in {@link lexemes} of the first lexeme in the current token we're
   * merging.
   */
  let startIndex: number = -1;

  lexemes.forEach((lexeme, index) => {
    if (delimiterBalance > 0) {
      // We are waiting for a closing delimiter

      if (lexeme === closingDelimiter) {
        // Closing delimiter found
        --delimiterBalance;
      } else if (lexeme === openingDelimiter) {
        // Additional opening delimiter found
        ++delimiterBalance;
      }

      return;
    }

    if (leftToRightMap[lexeme] != null) {
      // Starting delimiter found
      openingDelimiter = lexeme;
      closingDelimiter = leftToRightMap[lexeme];
      delimiterBalance = 1;
    }

    if (startIndex < 0) {
      // This is the first lexeme to be joined
      startIndex = index;
    }

    const isSeparator = lexeme === separator && delimiterBalance === 0;

    if (isSeparator || index === lexemes.length - 1) {
      // This is the last lexeme to be joined
      const endIndex = isSeparator ? index : index + 1;
      result.push(lexemes.slice(startIndex, endIndex).join(""));
      startIndex = -1;
      if (isSeparator) {
        // Add the separator itself
        result.push(lexeme);
      }
    }
  });

  return result;
}

const separator = ",";

// Mapping between opening and closing delimiters
/* eslint-disable @typescript-eslint/naming-convention */
const leftToRightMap: { [key: string]: string } = {
  "(": ")",
  "{": "}",
  "<": ">",
  "[": "]",
  '"': '"',
  "'": "'",
  "`": "`",
};
/* eslint-enable @typescript-eslint/naming-convention */

interface Token {
  range: Range;
  type: "item" | "separator" | "boundary";
}
