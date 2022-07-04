import { Range, TextEditor } from "vscode";

/**
 * Takes the range for a collection and returns a list of tokens within that collection
 * @param editor The editor containing the range
 * @param collectionRange The range to look for tokens within
 * @param collectionBoundary Optional boundaries for collections. [], {}
 * @returns List of tokens
 */
export function tokenizeRange(
  editor: TextEditor,
  collectionRange: Range,
  collectionBoundary?: [Range, Range]
): Token[] {
  const { document } = editor;
  const text = document.getText(collectionRange);
  const lexemes = text.split(/([,(){}<>[\]"'`]|\\"|\\'|\\`)/g).filter(Boolean);
  const joinedLexemes = joinLexemesBySkippingMatchingPairs(lexemes);
  const tokens: Token[] = [];
  let offset = document.offsetAt(collectionRange.start);

  joinedLexemes.forEach((lexeme) => {
    // Whitespace found. Just skip
    if (lexeme.trim().length === 0) {
      offset += lexeme.length;
      return;
    }

    // Separator delimiter found.
    if (lexeme === delimiter) {
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

  if (collectionBoundary != null) {
    return [
      { type: "boundary", range: collectionBoundary[0] },
      ...tokens,
      { type: "boundary", range: collectionBoundary[1] },
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
  let delimiterCount = 0;
  let openingDelimiter: string | null = null;
  let closingDelimiter: string | null = null;
  let startIndex: number = -1;

  lexemes.forEach((lexeme, index) => {
    // We are waiting for a closing delimiter
    if (delimiterCount > 0) {
      // Closing delimiter found
      if (closingDelimiter === lexeme) {
        --delimiterCount;
      }
      // Additional opening delimiter found
      else if (openingDelimiter === lexeme) {
        ++delimiterCount;
      }
    }

    // Starting delimiter found
    else if (delimiters[lexeme] != null) {
      openingDelimiter = lexeme;
      closingDelimiter = delimiters[lexeme];
      delimiterCount = 1;
      // This is the first lexeme to be joined
      if (startIndex < 0) {
        startIndex = index;
      }
    }

    // This is the first lexeme to be joined
    else if (startIndex < 0) {
      startIndex = index;
    }

    const isDelimiter = lexeme === delimiter && delimiterCount === 0;

    // This is the last lexeme to be joined
    if (isDelimiter || index === lexemes.length - 1) {
      const endIndex = isDelimiter ? index : index + 1;
      result.push(lexemes.slice(startIndex, endIndex).join(""));
      startIndex = -1;
      if (isDelimiter) {
        result.push(lexeme);
      }
    }
  });

  return result;
}

const delimiter = ",";

// Mapping between opening and closing delimiters
/* eslint-disable @typescript-eslint/naming-convention */
const delimiters: { [key: string]: string } = {
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
