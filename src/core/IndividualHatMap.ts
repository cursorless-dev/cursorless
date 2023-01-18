import { getKey, TextDocument } from "@cursorless/common";
import tokenGraphemeSplitter from "../libs/cursorless-engine/singletons/tokenGraphemeSplitter.singleton";
import { Graph, Token } from "../typings/Types";
import { HatStyleName } from "../libs/common/ide/types/hatStyles.types";
import { TokenHat } from "../util/allocateHats/allocateHats";

export interface ReadOnlyHatMap {
  getEntries(): [string, Token][];
  getToken(hatStyle: HatStyleName, character: string): Token;
}

export class IndividualHatMap implements ReadOnlyHatMap {
  private isExpired: boolean = false;
  private documentTokenLists: Map<string, Token[]> = new Map();
  private deregisterFunctions: (() => void)[] = [];

  private map: {
    [decoratedCharacter: string]: Token;
  } = {};

  private _tokenHats: readonly TokenHat[] = [];

  get tokenHats() {
    return this._tokenHats;
  }

  constructor(private graph: Graph) {}

  private getDocumentTokenList(document: TextDocument) {
    const key = document.uri.toString();
    let currentValue = this.documentTokenLists.get(key);

    if (currentValue == null) {
      currentValue = [];
      this.documentTokenLists.set(key, currentValue);
      this.deregisterFunctions.push(
        this.graph.rangeUpdater.registerRangeInfoList(document, currentValue),
      );
    }

    return currentValue;
  }

  clone() {
    const ret = new IndividualHatMap(this.graph);

    this.getEntries().forEach(([key, token]) => {
      ret.addTokenByKey(key, { ...token });
    });

    return ret;
  }

  getEntries() {
    this.checkExpired();
    return Object.entries(this.map);
  }

  private addTokenByKey(key: string, token: Token) {
    this.map[key] = token;
    this.getDocumentTokenList(token.editor.document).push(token);
  }

  setTokenHats(tokenHats: readonly TokenHat[]) {
    this.map = {};
    this.documentTokenLists = new Map();
    this.deregisterFunctions.forEach((func) => func());

    tokenHats.forEach(({ hatStyle, grapheme, token }) => {
      this.addTokenByKey(getKey(hatStyle, grapheme), token);
    });

    this._tokenHats = tokenHats;
  }

  getToken(hatStyle: HatStyleName, character: string) {
    this.checkExpired();
    return this.map[
      getKey(hatStyle, tokenGraphemeSplitter().normalizeGrapheme(character))
    ];
  }

  checkExpired() {
    if (this.isExpired) {
      throw Error("Map snapshot has expired");
    }
  }

  dispose() {
    this.isExpired = true;
    this.deregisterFunctions.forEach((func) => func());
  }
}
