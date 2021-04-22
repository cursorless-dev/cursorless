import { TextDocumentChangeEvent } from "vscode";
import { SymbolColor } from "./constants";
import { Token } from "./Types";

/**
 * Maps from (color, character) pairs to tokens
 */
export default class NavigationMap {
  updateTokenRanges(edit: TextDocumentChangeEvent) {
    Object.entries(this.map).forEach(([coloredSymbol, token]) => {
      if (token.editor.document !== edit.document) {
        return;
      }

      edit.contentChanges.forEach((editComponent) => {
        if (editComponent.range.start.isAfterOrEqual(token.range.end)) {
          return;
        }

        if (editComponent.range.end.isAfter(token.range.start)) {
          // If there is overlap, we just delete the token
          delete this.map[coloredSymbol];
          return;
        }

        const editDiff = editComponent.text.length - editComponent.rangeLength;

        const startOffset = token.startOffset + editDiff;
        const endOffset = token.endOffset + editDiff;

        token.range = token.range.with(
          edit.document.positionAt(startOffset),
          edit.document.positionAt(endOffset)
        );
      });
    });
  }

  private map: {
    [coloredSymbol: string]: Token;
  } = {};

  private getKey(color: SymbolColor, character: string) {
    return `${color}.${character}`;
  }

  public addToken(color: SymbolColor, character: string, token: Token) {
    this.map[this.getKey(color, character)] = token;
  }

  public getToken(color: SymbolColor, character: string) {
    return this.map[this.getKey(color, character)];
  }
}
