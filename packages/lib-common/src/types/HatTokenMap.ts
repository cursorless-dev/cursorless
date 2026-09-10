import type { HatStyleName } from "../ide/types/hatStyles.types";
import type { Range } from "./Range";
import type { TextEditor } from "./TextEditor";
import type { Token } from "./Token";

/**
 * Maps from (hatStyle, character) pairs to tokens
 */
export interface HatTokenMap {
  allocateHats(
    forceTokenHats?: TokenHat[],
    options?: HatAllocationOptions,
  ): Promise<void>;
  getReadableMap(usePrePhraseSnapshot: boolean): Promise<ReadOnlyHatMap>;
}

export interface HatAllocationOptions {
  /**
   * Whether to preserve previous hat assignments. Defaults to `true`.
   * Set to `false` to initialize an allocation independently of its history.
   */
  preserveExistingHats?: boolean;
}

export interface TokenHat {
  hatStyle: HatStyleName;
  grapheme: string;
  token: Token;
  hatRange: Range;
}

export interface ReadOnlyHatMap {
  getTokenHats(editor: TextEditor): readonly Readonly<TokenHat>[];
  getEntries(): readonly [string, Token][];
  getToken(hatStyle: HatStyleName, character: string): Token | undefined;
}
