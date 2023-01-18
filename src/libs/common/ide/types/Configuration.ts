import { Listener } from "@cursorless/common";
import { Disposable } from "./ide.types";
import { GetFieldType, Paths } from "./Paths";

export enum HatStability {
  /**
   * Only try to reuse an old hat when doing so wouldn't cause a token's hat
   * penalty to increase
   */
  low = 0,

  /**
   * Only try to reuse an old hat when doing so wouldn't cause a token's hat
   * penalty to cross the next whole nunber
   */
  lowRounded = 1,

  /**
   * Only try to reuse an old hat when doing so wouldn't cause a token's hat
   * penalty to go from <2 to >=2
   */
  medium = 2,

  /**
   * Always reuse a token's old hat unless a token with a higher score
   * (determined by proximity to cursor) needs to steal the hat to get its
   * desired penalty
   */
  high = 3,

  /**
   * Always reuse a token's old hat unless a token with a higher score
   * (determined by proximity to cursor) has no option but to steal a hat to get
   * a hat at all
   */
  higher = 4,

  /**
   * Never remove a hat from a token while the token remains visibl
   */
  strict = 5,
}

export type CursorlessConfiguration = {
  tokenHatSplittingMode: TokenHatSplittingMode;
  wordSeparators: string[];
  experimental: { snippetsDir: string | undefined; hatStability: HatStability };
  decorationDebounceDelayMs: number;
};

export type CursorlessConfigKey = keyof CursorlessConfiguration;
export type ConfigurationScope = { languageId: string };

export const CONFIGURATION_DEFAULTS: CursorlessConfiguration = {
  tokenHatSplittingMode: {
    preserveCase: false,
    lettersToPreserve: [],
    symbolsToPreserve: [],
  },
  wordSeparators: ["_"],
  decorationDebounceDelayMs: 50,
  experimental: { snippetsDir: undefined, hatStability: HatStability.low },
};

export interface Configuration {
  /**
   * Returns a Cursorless configuration value.  Dots are accepted in
   * {@link path}, and are interpreted as child access, eg
   * `experimental.snippetsDir`.
   *
   * @param path A configuration key or path.  Dots are interpreted as child
   * access
   * @param scope An optional scope specifier, indicating eg language id
   */
  getOwnConfiguration<Path extends Paths<CursorlessConfiguration>>(
    path: Path,
    scope?: ConfigurationScope,
  ): GetFieldType<CursorlessConfiguration, Path>;

  onDidChangeConfiguration(listener: Listener): Disposable;
}

export interface TokenHatSplittingMode {
  /**
   * Whether to distinguished between uppercase and lower case letters for hat
   */
  preserveCase: boolean;

  /**
   * A list of characters whose accents should not be stripped. This can be
   * used, for example, if you would like to strip all accents except for those
   * of a few characters, which you can add to this string.
   */
  lettersToPreserve: string[];

  /**
   * A list of symbols that shouldn't be normalized by the token hat splitter.
   * Add any extra symbols here that you have added to your
   * <user.any_alphanumeric_key> capture.
   */
  symbolsToPreserve: string[];
}
