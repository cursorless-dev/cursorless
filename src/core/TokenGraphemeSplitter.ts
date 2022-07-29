import { Disposable } from "../ide/ide.types";
import { Graph, TokenHatSplittingMode } from "../typings/Types";
import { Notifier } from "../util/Notifier";
import { matchAll } from "../util/regex";

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
      returnValue = returnValue.normalize("NFC");
    } else {
      returnValue = returnValue.normalize("NFD").replace(/\p{M}/gu, "");
    }

    if (!preserveCase) {
      returnValue = returnValue.toLowerCase();
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
