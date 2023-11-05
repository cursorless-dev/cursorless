import { Token } from "@cursorless/common";

interface TokenWithDisplayLine extends Token {
  displayLine: number;
}

/**
 * Gets a comparison function that can be used to sort tokens based on their
 * distance from the current cursor in terms of display lines and characters.
 * @param selectionDisplayLine The display line of the cursor location
 * @param selectionCharacterIndex The character index of current cursor within line
 */
export function getTokenComparator(
  selectionDisplayLine: number,
  selectionCharacterIndex: number,
): (a: TokenWithDisplayLine, b: TokenWithDisplayLine) => number {
  return (token1, token2) => {
    const token1LineDiff = Math.abs(token1.displayLine - selectionDisplayLine);
    const token2LineDiff = Math.abs(token2.displayLine - selectionDisplayLine);

    if (token1LineDiff < token2LineDiff) {
      return -1;
    }

    if (token1LineDiff > token2LineDiff) {
      return 1;
    }

    const token1CharacterDiff = Math.abs(
      token1.range.start.character - selectionCharacterIndex,
    );

    const token2CharacterDiff = Math.abs(
      token2.range.start.character - selectionCharacterIndex,
    );

    return token1CharacterDiff - token2CharacterDiff;
  };
}

/**
 * Scores tokens based on their
 * distance from the current cursor in terms of display lines.
 * @param selectionDisplayLine The display line of the cursor location
 * @param selectionCharacterIndex The character index of current cursor within line
 */
export function tokenScore(
  token: TokenWithDisplayLine,
  isActiveEditor: boolean,
  selectionDisplayLine: number,
): number {
  // See https://github.com/cursorless-dev/cursorless/issues/1278
  // for a discussion of the scoring function
  if (!isActiveEditor) {
    // worst score
    // todo: differentiate between near and far in inactive editors?
    return -3;
  }
  const lineDiff = Math.abs(token.displayLine - selectionDisplayLine);
  if (lineDiff <= 3) {
    return 0;
  }
  if (lineDiff <= 10) {
    return -1;
  }
  // Same editor, but far away
  return -2;
}
