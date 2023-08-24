import { deburr, escapeRegExp } from "lodash";
import { ide } from "../singletons/ide.singleton";
import type { TokenHatSplittingMode, Disposable } from "@cursorless/common";
import { Notifier } from "@cursorless/common";
import { matchAll } from "../util/regex";

/**
 * A list of all symbols that are speakable by default in knausj.
 */
const KNOWN_SYMBOLS = [
  "!",
  "#",
  "$",
  "%",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  "-",
  ".",
  "/",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "[",
  "\\",
  "]",
  "^",
  "_",
  "`",
  "{",
  "|",
  "}",
  "~",
  "£",
  '"',
];
const KNOWN_SYMBOL_REGEXP_STR = KNOWN_SYMBOLS.map(escapeRegExp).join("|");

const KNOWN_GRAPHEME_REGEXP_STR = ["[a-zA-Z0-9]", KNOWN_SYMBOL_REGEXP_STR].join(
  "|",
);

/**
 * Any token *not* matched by this regex will be mapped to {@link UNKNOWN}, so
 * that they will count as the same grapheme from the perspective of hat
 * allocation, and can be referred to using "special", "red special", etc.
 */
const KNOWN_GRAPHEME_MATCHER = new RegExp(
  `^(${KNOWN_GRAPHEME_REGEXP_STR})$`,
  "u",
);

/**
 * All unknown graphemes will be mapped to this value, so that they will count
 * as the same grapheme from the perspective of hat allocation, and can be
 * referred to using "special", "red special", etc.
 */
export const UNKNOWN = "[unk]";

/**
 * Regex used to split a token into graphemes.
 */
export const GRAPHEME_SPLIT_REGEX = /\p{L}\p{M}*|[\p{N}\p{P}\p{S}]/gu;

export class TokenGraphemeSplitter {
  private disposables: Disposable[] = [];
  private algorithmChangeNotifier = new Notifier();
  private tokenHatSplittingMode!: TokenHatSplittingMode;

  constructor() {
    ide().disposeOnExit(this);

    this.updateTokenHatSplittingMode =
      this.updateTokenHatSplittingMode.bind(this);
    this.getTokenGraphemes = this.getTokenGraphemes.bind(this);

    this.updateTokenHatSplittingMode();

    this.disposables.push(
      // Notify listeners in case the user changed their token hat splitting
      // setting.
      ide().configuration.onDidChangeConfiguration(
        this.updateTokenHatSplittingMode,
      ),
    );
  }

  private updateTokenHatSplittingMode() {
    const { lettersToPreserve, symbolsToPreserve, ...rest } =
      ide().configuration.getOwnConfiguration("tokenHatSplittingMode");

    this.tokenHatSplittingMode = {
      lettersToPreserve: lettersToPreserve.map((grapheme) =>
        grapheme.toLowerCase().normalize("NFC"),
      ),
      symbolsToPreserve: symbolsToPreserve.map((grapheme) =>
        grapheme.normalize("NFC"),
      ),
      ...rest,
    };

    this.algorithmChangeNotifier.notifyListeners();
  }

  /**
   * Splits {@link token} into a list of graphemes, normalised as per
   * {@link normalizeGrapheme}.
   * @param token The token to split
   * @returns A list of normalised graphemes in {@link token}
   */
  getTokenGraphemes = (token: string): Grapheme[] =>
    matchAll<Grapheme>(token, GRAPHEME_SPLIT_REGEX, (match) => ({
      text: this.normalizeGrapheme(match[0]),
      tokenStartOffset: match.index!,
      tokenEndOffset: match.index! + match[0].length,
    }));

  /**
   * Normalizes the grapheme {@link rawGraphemeText} based on user
   * configuration.  Proceeds as follows:
   *
   * 1. Runs text through Unicode NFC normalization to ensure that characters
   *    that look identical are handled the same (eg whether they use combining
   *    mark or single codepoint for diacritics).
   * 2. If the grapheme is a known grapheme, returns it.
   * 3. Transforms grapheme to lowercase if
   *    {@link TokenHatSplittingMode.preserveCase} is `false`
   * 3. Returns the (possibly case-normalised) grapheme if it appears in
   *    {@link TokenHatSplittingMode.lettersToPreserve}
   * 4. Strips diacritics from the grapheme
   * 5. If the grapheme doesn't match {@link KNOWN_GRAPHEME_MATCHER}, maps the
   *    grapheme to the constant {@link UNKNOWN}, so that it can be referred to
   *    using "special", "red special", etc.
   * 6. Returns the grapheme.
   *
   * @param rawGraphemeText The raw grapheme text to normalise
   * @returns The normalised grapheme
   */
  normalizeGrapheme(rawGraphemeText: string): string {
    const { preserveCase, lettersToPreserve, symbolsToPreserve } =
      this.tokenHatSplittingMode;

    // We always normalise the grapheme so that the user doesn't get confusing
    // behaviour where the grapheme is represented as the naked grapheme and a
    // separate combining diacritic, but they pass in the combined version of
    // the grapheme.
    let returnValue = rawGraphemeText.normalize("NFC");

    if (symbolsToPreserve.includes(returnValue)) {
      return returnValue;
    }

    if (!preserveCase) {
      returnValue = returnValue.toLowerCase();
    }

    if (lettersToPreserve.includes(returnValue.toLowerCase())) {
      return returnValue;
    }

    returnValue = deburr(returnValue);

    if (!KNOWN_GRAPHEME_MATCHER.test(returnValue)) {
      returnValue = UNKNOWN;
    }

    return returnValue;
  }

  /**
   * Register to be notified when the graphing splitting algorithm changes, for example if
   * the user changes the setting to enable preserving case
   * @param listener A function to be called when graphing splitting algorithm changes
   * @returns A function that can be called to unsubscribe from notifications
   */
  registerAlgorithmChangeListener =
    this.algorithmChangeNotifier.registerListener;

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());
  }
}

export interface Grapheme {
  /** The normalised text of the grapheme. */
  text: string;

  /** The start offset of the grapheme within its containing token */
  tokenStartOffset: number;

  /** The end offset of the grapheme within its containing token */
  tokenEndOffset: number;
}
