import type { Disposable, TokenHat } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import tokenGraphemeSplitter from "../singletons/tokenGraphemeSplitter.singleton";
import { Graph } from "../typings/Graph";
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

    this.allocateHatsDebounced = this.allocateHatsDebounced.bind(this);

    this.disposables.push(
      ide().hats.onDidChangeEnabledHatStyles(this.allocateHatsDebounced),
      ide().hats.onDidChangeIsEnabled(this.allocateHatsDebounced),

      // An event that fires when a text document opens
      ide().onDidOpenTextDocument(this.allocateHatsDebounced),
      // An event that fires when a text document closes
      ide().onDidCloseTextDocument(this.allocateHatsDebounced),
      // An Event which fires when the active editor has changed. Note that the event also fires when the active editor changes to undefined.
      ide().onDidChangeActiveTextEditor(this.allocateHatsDebounced),
      // An Event which fires when the array of visible editors has changed.
      ide().onDidChangeVisibleTextEditors(this.allocateHatsDebounced),
      // An event that is emitted when a text document is changed. This usually happens when the contents changes but also when other things like the dirty-state changes.
      ide().onDidChangeTextDocument(this.allocateHatsDebounced),
      // An Event which fires when the selection in an editor has changed.
      ide().onDidChangeTextEditorSelection(this.allocateHatsDebounced),
      // An Event which fires when the visible ranges of an editor has changed.
      ide().onDidChangeTextEditorVisibleRanges(this.allocateHatsDebounced),
      // Re-draw hats on grapheme splitting algorithm change in case they
      // changed their token hat splitting setting.
      tokenGraphemeSplitter().registerAlgorithmChangeListener(
        this.allocateHatsDebounced,
      ),
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

    const tokenHats = ide().hats.isEnabled
      ? allocateHats(
          tokenGraphemeSplitter(),
          ide().hats.enabledHatStyles,
          oldTokenHats ?? activeMap.tokenHats,
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

  allocateHatsDebounced() {
    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
    }

    const decorationDebounceDelayMs = ide().configuration.getOwnConfiguration(
      "decorationDebounceDelayMs",
    );

    this.timeoutHandle = setTimeout(() => {
      this.allocateHats();
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
