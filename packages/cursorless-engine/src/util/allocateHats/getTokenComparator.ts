import type { Token } from "@cursorless/common";

interface TokenWithDisplayLine extends Token {
  displayLine: number;
}

/**
 * Gets a comparison function that can be used to sort tokens based on their
 * distance from the current cursor in terms of display lines.
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
