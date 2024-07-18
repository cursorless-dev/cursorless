import { Listener } from "../..";
import { HatStability } from "./HatStability";
import { Disposable } from "./ide.types";
import { GetFieldType, Paths } from "./Paths";

export type CursorlessConfiguration = {
  tokenHatSplittingMode: TokenHatSplittingMode;
  wordSeparators: string[];
  experimental: {
    snippetsDir: string | undefined;
    hatStability: HatStability;
    keyboardTargetFollowsSelection: boolean;
  };
  decorationDebounceDelayMs: number;
  commandHistory: boolean;
  debug: boolean;
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
  experimental: {
    snippetsDir: undefined,
    hatStability: HatStability.balanced,
    keyboardTargetFollowsSelection: false,
  },
  commandHistory: false,
  debug: false,
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
