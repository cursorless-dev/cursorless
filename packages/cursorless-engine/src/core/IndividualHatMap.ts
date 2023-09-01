import type {
  HatStyleName,
  ReadOnlyHatMap,
  TextDocument,
  Token,
  TokenHat,
} from "@cursorless/common";
import { getKey } from "@cursorless/common";
import tokenGraphemeSplitter from "../singletons/tokenGraphemeSplitter.singleton";
import { getMatcher } from "../tokenizer";
import type { FullRangeInfo } from "../typings/updateSelections";
import type { RangeUpdater } from "./updateSelections/RangeUpdater";

/**
 * A token with information that the rangeUpdater can use to keep its
 * {@link range} up to date.
 */
interface LiveToken extends Token, FullRangeInfo {}

export class IndividualHatMap implements ReadOnlyHatMap {
  private isExpired: boolean = false;
  private documentTokenLists: Map<string, LiveToken[]> = new Map();
  private deregisterFunctions: (() => void)[] = [];

  private map: {
    [decoratedCharacter: string]: LiveToken;
  } = {};

  private _tokenHats: readonly TokenHat[] = [];

  get tokenHats() {
    return this._tokenHats;
  }

  constructor(private rangeUpdater: RangeUpdater) {}

  private getDocumentTokenList(document: TextDocument) {
    const key = document.uri.toString();
    let currentValue = this.documentTokenLists.get(key);

    if (currentValue == null) {
      currentValue = [];
      this.documentTokenLists.set(key, currentValue);
      this.deregisterFunctions.push(
        this.rangeUpdater.registerRangeInfoList(document, currentValue),
      );
    }

    return currentValue;
  }

  clone() {
    const ret = new IndividualHatMap(this.rangeUpdater);

    ret.setTokenHats(this._tokenHats);

    return ret;
  }

  /**
   * Overwrites the hat assignemnt for this hat token map.
   *
   * @param tokenHats The new hat assignments
   */
  setTokenHats(tokenHats: readonly TokenHat[]) {
    // Clear the old assignment
    this.map = {};
    this.documentTokenLists = new Map();
    this.deregisterFunctions.forEach((func) => func());

    // Iterate through the hats in the new assignment, registering them with the
    // rangeUpdater so that their ranges stay up to date
    const liveTokenHats: TokenHat[] = tokenHats.map((tokenHat) => {
      const { hatStyle, grapheme, token } = tokenHat;
      const liveToken: LiveToken = this.makeTokenLive(token);
      this.map[getKey(hatStyle, grapheme)] = liveToken;

      return { ...tokenHat, token: liveToken };
    });

    this._tokenHats = liveTokenHats;
  }

  private makeTokenLive(token: Token): LiveToken {
    const { tokenMatcher } = getMatcher(token.editor.document.languageId);

    const liveToken: LiveToken = {
      ...token,
      expansionBehavior: {
        start: {
          type: "regex",
          regex: tokenMatcher,
        },
        end: {
          type: "regex",
          regex: tokenMatcher,
        },
      },
    };

    this.getDocumentTokenList(token.editor.document).push(liveToken);

    return liveToken;
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
