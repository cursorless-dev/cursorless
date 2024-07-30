import type { Disposable, Hats, TokenHat } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import tokenGraphemeSplitter from "../singletons/tokenGraphemeSplitter.singleton";
import { allocateHats } from "../util/allocateHats";
import { IndividualHatMap } from "./IndividualHatMap";
import { DecorationDebouncer } from "../util/DecorationDebouncer";

interface Context {
  getActiveMap(): Promise<IndividualHatMap>;
}

export class HatAllocator {
  private disposables: Disposable[] = [];

  constructor(
    private hats: Hats,
    private context: Context,
  ) {
    ide().disposeOnExit(this);

    const debouncer = new DecorationDebouncer(ide().configuration, () =>
      this.allocateHats(),
    );

    this.disposables.push(
      this.hats.onDidChangeEnabledHatStyles(debouncer.run),
      this.hats.onDidChangeIsEnabled(debouncer.run),

      // An event that fires when a text document opens
      ide().onDidOpenTextDocument(debouncer.run),
      // An event that fires when a text document closes
      ide().onDidCloseTextDocument(debouncer.run),
      // An Event which fires when the active editor has changed. Note that the event also fires when the active editor changes to undefined.
      ide().onDidChangeActiveTextEditor(debouncer.run),
      // An Event which fires when the array of visible editors has changed.
      ide().onDidChangeVisibleTextEditors(debouncer.run),
      // An event that is emitted when a text document is changed. This usually happens when the contents changes but also when other things like the dirty-state changes.
      ide().onDidChangeTextDocument(debouncer.run),
      // An Event which fires when the selection in an editor has changed.
      ide().onDidChangeTextEditorSelection(debouncer.run),
      // An Event which fires when the visible ranges of an editor has changed.
      ide().onDidChangeTextEditorVisibleRanges(debouncer.run),
      // Re-draw hats on grapheme splitting algorithm change in case they
      // changed their token hat splitting setting.
      tokenGraphemeSplitter().registerAlgorithmChangeListener(debouncer.run),

      debouncer,
    );
  }

  /**
   * Allocate hats to the visible tokens.
   *
   * @param forceTokenHats If supplied, force the allocator to use these hats
   * for the given tokens. This is used for the tutorial, and for testing.
   */
  async allocateHats(forceTokenHats?: TokenHat[]) {
    const activeMap = await this.context.getActiveMap();

    // Forced graphemes won't have been normalized
    forceTokenHats = forceTokenHats?.map((tokenHat) => ({
      ...tokenHat,
      grapheme: tokenGraphemeSplitter().normalizeGrapheme(tokenHat.grapheme),
    }));

    const tokenHats = this.hats.isEnabled
      ? allocateHats({
          tokenGraphemeSplitter: tokenGraphemeSplitter(),
          enabledHatStyles: this.hats.enabledHatStyles,
          forceTokenHats,
          oldTokenHats: activeMap.tokenHats,
          hatStability: ide().configuration.getOwnConfiguration(
            "experimental.hatStability",
          ),
          activeTextEditor: ide().activeTextEditor,
          visibleTextEditors: ide().visibleTextEditors,
        })
      : [];

    activeMap.setTokenHats(tokenHats);

    await this.hats.setHatRanges(
      tokenHats.map(({ hatStyle, hatRange, token: { editor } }) => ({
        editor,
        range: hatRange,
        styleName: hatStyle,
      })),
    );
  }

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());
  }
}
