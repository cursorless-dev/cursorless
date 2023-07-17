import type { Disposable, Hats, TokenHat } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import tokenGraphemeSplitter from "../singletons/tokenGraphemeSplitter.singleton";
import { allocateHats } from "../util/allocateHats";
import { Debouncer } from "./Debouncer";
import { IndividualHatMap } from "./IndividualHatMap";

interface Context {
  getActiveMap(): Promise<IndividualHatMap>;
}

export class HatAllocator {
  private disposables: Disposable[] = [];
  private debouncer = new Debouncer(() => this.allocateHats());

  constructor(private hats: Hats, private context: Context) {
    ide().disposeOnExit(this);

    this.disposables.push(
      this.hats.onDidChangeEnabledHatStyles(this.debouncer.run),
      this.hats.onDidChangeIsEnabled(this.debouncer.run),

      // An event that fires when a text document opens
      ide().onDidOpenTextDocument(this.debouncer.run),
      // An event that fires when a text document closes
      ide().onDidCloseTextDocument(this.debouncer.run),
      // An Event which fires when the active editor has changed. Note that the event also fires when the active editor changes to undefined.
      ide().onDidChangeActiveTextEditor(this.debouncer.run),
      // An Event which fires when the array of visible editors has changed.
      ide().onDidChangeVisibleTextEditors(this.debouncer.run),
      // An event that is emitted when a text document is changed. This usually happens when the contents changes but also when other things like the dirty-state changes.
      ide().onDidChangeTextDocument(this.debouncer.run),
      // An Event which fires when the selection in an editor has changed.
      ide().onDidChangeTextEditorSelection(this.debouncer.run),
      // An Event which fires when the visible ranges of an editor has changed.
      ide().onDidChangeTextEditorVisibleRanges(this.debouncer.run),
      // Re-draw hats on grapheme splitting algorithm change in case they
      // changed their token hat splitting setting.
      tokenGraphemeSplitter().registerAlgorithmChangeListener(
        this.debouncer.run,
      ),

      this.debouncer,
    );
  }

  /**
   * Allocate hats to the visible tokens.
   *
   * @param oldTokenHats If supplied, pretend that this allocation was the
   * previous allocation when trying to maintain stable hats.  This parameter is
   * used for testing.
   */
  async allocateHats(oldTokenHats?: TokenHat[]) {
    const activeMap = await this.context.getActiveMap();

    const tokenHats = this.hats.isEnabled
      ? allocateHats(
          tokenGraphemeSplitter(),
          this.hats.enabledHatStyles,
          oldTokenHats ?? activeMap.tokenHats,
          ide().configuration.getOwnConfiguration("experimental.hatStability"),
          ide().activeTextEditor,
          ide().visibleTextEditors,
        )
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
