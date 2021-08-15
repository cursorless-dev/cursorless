import { TextDocumentChangeEvent, Range, TextDocument } from "vscode";
import { SymbolColor } from "./constants";
import { selectionWithEditorFromPositions } from "./selectionUtils";
import { SelectionWithEditor, Token } from "./Types";

/**
 * Maps from (color, character) pairs to tokens
 */
export default class NavigationMap {
  updateTokenRanges(edit: TextDocumentChangeEvent) {
    edit.contentChanges.forEach((editComponent) => {
      // Amount by which to shift ranges
      const shift = editComponent.text.length - editComponent.rangeLength;

      Object.entries(this.map).forEach(([coloredSymbol, token]) => {
        if (token.editor.document !== edit.document) {
          return;
        }

        if (editComponent.range.start.isAfterOrEqual(token.range.end)) {
          return;
        }

        if (editComponent.range.end.isAfter(token.range.start)) {
          // If there is overlap, we just delete the token
          delete this.map[coloredSymbol];
          return;
        }

        const startOffset = token.startOffset + shift;
        const endOffset = token.endOffset + shift;

        token.range = token.range.with(
          edit.document.positionAt(startOffset),
          edit.document.positionAt(endOffset)
        );
        token.startOffset = startOffset;
        token.endOffset = endOffset;
      });
    });
  }

  private map: {
    [coloredSymbol: string]: Token;
  } = {};

  static getKey(color: SymbolColor, character: string) {
    return `${color}.${character}`;
  }

  static splitKey(key: string) {
    const [color, character] = key.split(".");
    return { color: color as SymbolColor, character };
  }

  public addToken(color: SymbolColor, character: string, token: Token) {
    this.map[NavigationMap.getKey(color, character)] = token;
  }

  public getToken(color: SymbolColor, character: string) {
    return this.map[NavigationMap.getKey(color, character)];
  }

  public clear() {
    this.map = {};
  }

  /**
   * Given a selection returns a new selection which contains the tokens
   * intersecting the given selection. Uses heuristics to tie break when the
   * given selection is empty and abuts 2 adjacent tokens
   * @param selection Selection to operate on
   * @returns Modified selection
   */
  public getTokenSelectionForSelection(
    selection: SelectionWithEditor
  ): SelectionWithEditor | null {
    const range = selection.selection;
    const tokens = range.isEmpty
      ? this.getTokensForEmptyRange(selection.editor.document, range)
      : this.getTokensForRange(selection.editor.document, range);
    if (tokens.length < 1) {
      return null;
    }
    const start = tokens[0].range.start;
    const end = tokens[tokens.length - 1].range.end;
    return selectionWithEditorFromPositions(selection, start, end);
  }

  // Return tokens for overlapping ranges
  private getTokensForRange(document: TextDocument, range: Range) {
    const tokens = Object.values(this.map).filter((token) => {
      if (token.editor.document !== document) {
        return false;
      }
      const intersection = token.range.intersection(range);
      return intersection != null && !intersection.isEmpty;
    });
    tokens.sort((a, b) => a.startOffset - b.startOffset);
    return tokens;
  }

  // Returned single token for overlapping or adjacent range
  private getTokensForEmptyRange(document: TextDocument, range: Range) {
    const tokens = Object.values(this.map).filter(
      (token) =>
        token.editor.document === document &&
        token.range.intersection(range) != null
    );

    // If multiple matches sort and take the first
    tokens.sort((a, b) => {
      // First sort on alphanumeric
      const aIsAlphaNum = isAlphaNum(a.text);
      const bIsAlphaNum = isAlphaNum(b.text);
      if (aIsAlphaNum && !bIsAlphaNum) {
        return -1;
      }
      if (bIsAlphaNum && !aIsAlphaNum) {
        return 1;
      }

      // Second sort on length
      const lengthDiff = b.text.length - a.text.length;
      if (lengthDiff !== 0) {
        return lengthDiff;
      }

      // Lastly sort on start position. ie leftmost
      return a.startOffset - b.startOffset;
    });

    return tokens.slice(0, 1);
  }
}

function isAlphaNum(text: string) {
  return /^\w+$/.test(text);
}
