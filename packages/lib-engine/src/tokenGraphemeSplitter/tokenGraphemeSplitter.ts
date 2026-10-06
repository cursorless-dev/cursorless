import { deburr, isEqual } from "lodash-es";
import type { Disposable, IDE, TalonSpokenForms } from "@cursorless/lib-common";
import { Notifier, matchAll } from "@cursorless/lib-common";
import { asciiRange } from "../util/asciiRange";

/**
 * A list of all graphemes that are speakable by default in community.
 */
const DEFAULT_GRAPHEMES = [
  // a–z
  ...asciiRange(97, 122),
  // 0–9
  ...asciiRange(48, 57),
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
  private graphemes: Set<string> = new Set(DEFAULT_GRAPHEMES);
  private updateGeneration = 0;
  readonly ready: Promise<void>;

  constructor(
    private ide: IDE,
    private talonSpokenForms: TalonSpokenForms,
  ) {
    ide.disposeOnExit(this);

    this.updateGraphemes = this.updateGraphemes.bind(this);
    this.getTokenGraphemes = this.getTokenGraphemes.bind(this);
    this.ready = this.updateGraphemes();
    this.disposables.push(talonSpokenForms.onDidChange(this.updateGraphemes));
  }

  private async updateGraphemes() {
    const generation = ++this.updateGeneration;
    const customGraphemes = await this.getCustomGraphemes();

    if (generation !== this.updateGeneration) {
      // Another update has occurred since this one started, so we should abort.
      return;
    }

    const graphemes = new Set([...DEFAULT_GRAPHEMES, ...customGraphemes]);
    if (!isEqual(this.graphemes, graphemes)) {
      this.graphemes = graphemes;
      this.algorithmChangeNotifier.notifyListeners();
    }
  }

  private async getCustomGraphemes() {
    try {
      const spokenForms = await this.talonSpokenForms.getSpokenForms();
      return spokenForms.spokenForms
        .filter((s) => s.type === "grapheme")
        .map((s) => s.id.normalize("NFC"));
    } catch {
      // Any errors are already handled in `CustomSpokenForms`.
      return [];
    }
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
   * Normalizes {@link rawGraphemeText} using the default graphemes and the
   * graphemes exported by Talon. Proceeds as follows:
   *
   * 1. Runs text through Unicode NFC normalization to ensure that characters
   *    that look identical are handled the same (eg whether they use combining
   *    mark or single codepoint for diacritics).
   * 2. If the grapheme is a known grapheme, returns it.
   * 3. Converts the grapheme to lowercase and returns it if it is known.
   * 4. Strips diacritics and returns the resulting grapheme if it is known.
   * 5. Returns {@link UNKNOWN} if none of these forms is known, so that the
   *    grapheme can be referred to using "special", "red special", etc.
   *
   * @param rawGraphemeText The raw grapheme text to normalise
   * @returns The normalised grapheme
   */
  normalizeGrapheme(rawGraphemeText: string): string {
    // We always normalise the grapheme so that the user doesn't get confusing
    // behaviour where the grapheme is represented as the naked grapheme and a
    // separate combining diacritic, but they pass in the combined version of
    // the grapheme.
    let returnValue = rawGraphemeText.normalize("NFC");

    // 1) "Å" is a valid grapheme
    if (this.graphemes.has(returnValue)) {
      return returnValue;
    }

    returnValue = returnValue.toLowerCase();

    // 2) "å" is a valid grapheme after converting to lowercase
    if (this.graphemes.has(returnValue)) {
      return returnValue;
    }

    returnValue = deburr(returnValue);

    // 3) "a" is a valid grapheme after stripping diacritics
    if (this.graphemes.has(returnValue)) {
      return returnValue;
    }

    // 4) None of the above forms is known, so we return UNKNOWN
    return UNKNOWN;
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
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
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
