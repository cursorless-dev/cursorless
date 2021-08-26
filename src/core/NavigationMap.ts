import { TextDocumentChangeEvent, Range } from "vscode";
import { HatStyleName } from "./constants";
import { SelectionWithEditor, Token } from "../typings/Types";

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

  static getKey(color: HatStyleName, character: string) {
    return `${color}.${character}`;
  }

  static splitKey(key: string) {
    const [color, character] = key.split(".");
    return { color: color as HatStyleName, character };
  }

  public addToken(color: HatStyleName, character: string, token: Token) {
    this.map[NavigationMap.getKey(color, character)] = token;
  }

  public getToken(color: HatStyleName, character: string) {
    return this.map[NavigationMap.getKey(color, character)];
  }

  public clear() {
    this.map = {};
  }

  public getTokenIntersectionsForSelection(selection: SelectionWithEditor) {
    const tokenIntersections: { token: Token; intersection: Range }[] = [];
    Object.values(this.map).forEach((token) => {
      if (token.editor.document === selection.editor.document) {
        const intersection = token.range.intersection(selection.selection);
        if (intersection != null) {
          tokenIntersections.push({ token, intersection });
        }
      }
    });
    return tokenIntersections;
  }
}
