import { escapeRegExp } from "lodash";
import { Disposable } from "../ide/ide.types";
import { Graph, TokenHatSplittingMode } from "../typings/Types";
import { Notifier } from "../util/Notifier";
import { matchAll } from "../util/regex";

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
const KNOWN_SYMBOL_REGEXP = KNOWN_SYMBOLS.map(escapeRegExp).join("|");

const KNOWN_GRAPHEME_REGEXP = [
  "\\p{L}\\p{M}*",
  "[0-9]",
  KNOWN_SYMBOL_REGEXP,
].join("|");
const KNOWN_GRAPHEME_MATCHER = new RegExp(`^${KNOWN_GRAPHEME_REGEXP}$`, "gu");

const UNKNOWN = "[unk]";

export class TokenGraphemeSplitter {
  private disposables: Disposable[] = [];
  private algorithmChangeNotifier = new Notifier();
  private tokenHatSplittingMode!: TokenHatSplittingMode;

  constructor(private graph: Graph) {
    graph.ide.disposeOnExit(this);

    this.updateTokenHatSplittingMode =
      this.updateTokenHatSplittingMode.bind(this);
    this.getTokenGraphemes = this.getTokenGraphemes.bind(this);

    this.updateTokenHatSplittingMode();

    this.disposables.push(
      // Notify listeners in case the user changed their token hat splitting
      // setting.
      this.graph.ide.configuration.onDidChangeConfiguration(
        this.updateTokenHatSplittingMode
      )
    );
  }

  private updateTokenHatSplittingMode() {
    this.tokenHatSplittingMode =
      this.graph.ide.configuration.getOwnConfiguration<TokenHatSplittingMode>(
        "tokenHatSplittingMode"
      )!;

    this.algorithmChangeNotifier.notifyListeners();
  }

  getTokenGraphemes(text: string): Grapheme[] {
    return matchAll<Grapheme>(text, /\p{L}\p{M}*|\P{L}/gu, (match) => {
      return {
        text: this.normalizeGrapheme(match[0]),
        tokenStartOffset: match.index!,
        tokenEndOffset: match.index! + match[0].length,
      };
    });
  }

  normalizeGrapheme(rawGraphemeText: string): string {
    const { preserveCase, preserveAccents } = this.tokenHatSplittingMode;

    let returnValue = rawGraphemeText;

    if (preserveAccents) {
      // If we preserve accents, we still normalise the grapheme so that the
      // user doesn't get confusing behaviour where the grapheme is represented
      // as the naked grapheme and a separate combining diacritic, but they
      // pass in the combined version of the grapheme.
      returnValue = returnValue.normalize("NFC");
    } else {
      // Separate into naked char and combinining diacritic, then remove the
      // diacritic
      returnValue = returnValue.normalize("NFD").replace(/\p{M}/gu, "");
    }

    if (!preserveCase) {
      returnValue = returnValue.toLowerCase();
    }

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
