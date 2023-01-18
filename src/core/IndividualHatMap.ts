import { getKey, TextDocument } from "@cursorless/common";
import tokenGraphemeSplitter from "../libs/cursorless-engine/singletons/tokenGraphemeSplitter.singleton";
import { Graph, Token } from "../typings/Types";
import { HatStyleName } from "../libs/common/ide/types/hatStyles.types";
import { TokenHat } from "../util/allocateHats/allocateHats";
import { FullRangeInfo } from "../typings/updateSelections";
import { getMatcher } from "../libs/cursorless-engine/tokenizer";

export interface ReadOnlyHatMap {
  getEntries(): readonly [string, Token][];
  getToken(hatStyle: HatStyleName, character: string): Token;
}

interface FullToken extends Token, FullRangeInfo {}

export class IndividualHatMap implements ReadOnlyHatMap {
  private isExpired: boolean = false;
  private documentTokenLists: Map<string, FullToken[]> = new Map();
  private deregisterFunctions: (() => void)[] = [];

  private map: {
    [decoratedCharacter: string]: FullToken;
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

    ret.setTokenHats(this._tokenHats);

    return ret;
  }

  setTokenHats(tokenHats: readonly TokenHat[]) {
    this.map = {};
    this.documentTokenLists = new Map();
    this.deregisterFunctions.forEach((func) => func());

    tokenHats.forEach(({ hatStyle, grapheme, token }) => {
      const languageId = token.editor.document.languageId;

      const fullToken: FullToken = {
        ...token,
        expansionBehavior: {
          start: {
            type: "regex",
            regex: getMatcher(languageId).tokenMatcher,
          },
          end: {
            type: "regex",
            regex: getMatcher(languageId).tokenMatcher,
          },
        },
      };

      this.map[getKey(hatStyle, grapheme)] = fullToken;
      this.getDocumentTokenList(token.editor.document).push(fullToken);
    });

    this._tokenHats = tokenHats;
  }

  getEntries(): readonly [string, Token][] {
    this.checkExpired();
    return Object.entries(this.map);
  }

  getToken(hatStyle: HatStyleName, character: string): Token {
    this.checkExpired();
    return this.map[
      getKey(hatStyle, tokenGraphemeSplitter().normalizeGrapheme(character))
    ];
  }

  private checkExpired() {
    if (this.isExpired) {
      throw Error("Map snapshot has expired");
    }
  }

  dispose() {
    this.isExpired = true;
    this.deregisterFunctions.forEach((func) => func());
  }
}
