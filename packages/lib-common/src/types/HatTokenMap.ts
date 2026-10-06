import type { HatStyleName } from "../ide/types/hatStyles.types";
import type { Range } from "./Range";
import type { TextEditor } from "./TextEditor";
import type { Token } from "./Token";

/**
 * Maps from (hatStyle, character) pairs to tokens
 */
export interface HatTokenMap {
  allocateHats(options?: HatAllocationOptions): Promise<void>;
  getReadableMap(usePrePhraseSnapshot: boolean): Promise<ReadOnlyHatMap>;
}

export interface HatAllocationOptions {
  /**
   * Whether to ignore previous hat assignments and allocate from scratch.
   * Defaults to `false`. Forced hats still apply when starting fresh.
   */
  startFresh?: boolean;

  /** If supplied, force the allocator to use these hats
   * for the given tokens. This is used for the tutorial, and for testing.
   */
  forceTokenHats?: TokenHat[];
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
