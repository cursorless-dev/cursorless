import type { HatStyleName } from "../ide/types/hatStyles.types";
import type { SimpleTokenHat } from "../util/toPlainObject";
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
   * Recorded assignments to use as allocation history instead of the current
   * map. Omit to preserve the current assignments.
   */
  initialHats?: { editor: TextEditor; hats: readonly SimpleTokenHat[] };
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
