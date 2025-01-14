import type { HatStyleName } from "../ide/types/hatStyles.types";
import type { Range } from "./Range";
import type { Token } from "./Token";

/**
 * Maps from (hatStyle, character) pairs to tokens
 */
export interface HatTokenMap {
  allocateHats(forceTokenHats?: TokenHat[]): Promise<void>;
  getReadableMap(usePrePhraseSnapshot: boolean): Promise<ReadOnlyHatMap>;
}

export interface TokenHat {
  hatStyle: HatStyleName;
  grapheme: string;
  token: Token;
  hatRange: Range;
}

export interface ReadOnlyHatMap {
  getEntries(): readonly [string, Token][];
  getToken(hatStyle: HatStyleName, character: string): Token | undefined;
}
