import type { Disposable } from "../libs/common/ide/types/ide.types";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import tokenGraphemeSplitter from "../libs/cursorless-engine/singletons/tokenGraphemeSplitter.singleton";
import { Graph } from "../typings/Types";
import { allocateHats } from "../util/allocateHats";
import { IndividualHatMap } from "./IndividualHatMap";

interface Context {
  getActiveMap(): Promise<IndividualHatMap>;
}

export class HatAllocator {
  private timeoutHandle: NodeJS.Timeout | null = null;
  private disposables: Disposable[] = [];

  constructor(private graph: Graph, private context: Context) {
    ide().disposeOnExit(this);

    this.addDecorationsDebounced = this.addDecorationsDebounced.bind(this);

    this.disposables.push(
      ide().hats.onDidChangeEnabledHatStyles(this.addDecorationsDebounced),
      ide().hats.onDidChangeIsEnabled(this.addDecorationsDebounced),

      // An event that fires when a text document opens
      ide().onDidOpenTextDocument(this.addDecorationsDebounced),
      // An event that fires when a text document closes
      ide().onDidCloseTextDocument(this.addDecorationsDebounced),
      // An Event which fires when the active editor has changed. Note that the event also fires when the active editor changes to undefined.
      ide().onDidChangeActiveTextEditor(this.addDecorationsDebounced),
      // An Event which fires when the array of visible editors has changed.
      ide().onDidChangeVisibleTextEditors(this.addDecorationsDebounced),
      // An event that is emitted when a text document is changed. This usually happens when the contents changes but also when other things like the dirty-state changes.
      ide().onDidChangeTextDocument(this.addDecorationsDebounced),
      // An Event which fires when the selection in an editor has changed.
      ide().onDidChangeTextEditorSelection(this.addDecorationsDebounced),
      // An Event which fires when the visible ranges of an editor has changed.
      ide().onDidChangeTextEditorVisibleRanges(this.addDecorationsDebounced),
      // Re-draw hats on grapheme splitting algorithm change in case they
      // changed their token hat splitting setting.
      tokenGraphemeSplitter().registerAlgorithmChangeListener(
        this.addDecorationsDebounced,
      ),
    );
  }

  async addDecorations() {
    const activeMap = await this.context.getActiveMap();

    const tokenHats = ide().hats.isEnabled
      ? allocateHats(
          tokenGraphemeSplitter(),
          ide().hats.enabledHatStyles,
          activeMap.tokenHats,
          ide().configuration.getOwnConfiguration("experimental.hatStability"),
          ide().activeTextEditor,
          ide().visibleTextEditors,
        )
      : [];

    activeMap.setTokenHats(tokenHats);

    await ide().hats.setHatRanges(
      tokenHats.map(({ hatStyle, hatRange, token: { editor } }) => ({
        editor,
        range: hatRange,
        styleName: hatStyle,
      })),
    );
  }

  addDecorationsDebounced() {
    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
    }

    const decorationDebounceDelayMs = ide().configuration.getOwnConfiguration(
      "decorationDebounceDelayMs",
    );

    this.timeoutHandle = setTimeout(() => {
      this.addDecorations();
      this.timeoutHandle = null;
    }, decorationDebounceDelayMs);
  }

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());

    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
    }
  }
}
