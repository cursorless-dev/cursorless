/**
 * Vendored from cursorless getTokenComparator.ts (byte-identical to both the
 * pin at SHA 42452eba521bb9cccbb3e04a2cd9e9afcf6cbffe and current upstream).
 *
 * Kept local rather than imported from @cursorless/lib-engine because the
 * engine version types `TokenWithDisplayLine extends Token` against
 * lib-common's FULL `Token` (editor.document, method-bearing Range, ...). The
 * standalone allocator builds its comparator input from the SIMPLIFIED Token
 * in ../common/types, which is not assignable to lib-common's Token, so the
 * imported signature would not typecheck against rank.ts's call site. The
 * regex and the pure-generic maxByFirstDiffering ARE imported from source;
 * this one stays local for that type-compatibility reason only.
 *
 * Edits are IMPORT REWRITES ONLY:
 *   - "@cursorless/common" -> "../common" barrel
 */

import { Token } from "../common";

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
