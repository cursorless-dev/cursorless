import { SymbolColor } from "./constants";
import { Token } from "./Types";

/**
 * Maps from (color, character) pairs to tokens
 */
export default class NavigationMap {
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
