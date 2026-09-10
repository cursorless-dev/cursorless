import type {
  Disposable,
  HatAllocationOptions,
  Hats,
  IDE,
  TokenHat,
} from "@cursorless/lib-common";
import { plainObjectToRange } from "@cursorless/lib-common";
import type { TokenGraphemeSplitter } from "../tokenGraphemeSplitter";
import { allocateHats } from "../util/allocateHats";
import { getTokensInRange } from "../util/allocateHats/getTokensInRange";
import { DecorationDebouncer } from "../util/DecorationDebouncer";
import type { IndividualHatMap } from "./IndividualHatMap";

interface Context {
  getActiveMap(): Promise<IndividualHatMap>;
}

export class HatAllocator {
  private disposables: Disposable[] = [];

  constructor(
    private ide: IDE,
    private tokenGraphemeSplitter: TokenGraphemeSplitter,
    private hats: Hats,
    private context: Context,
  ) {
    ide.disposeOnExit(this);

    const debouncer = new DecorationDebouncer(ide.configuration, () =>
      this.allocateHats(),
    );

    this.disposables.push(
      this.hats.onDidChangeEnabledHatStyles(debouncer.run),
      this.hats.onDidChangeIsEnabled(debouncer.run),

      // An event that fires when a text document opens
      ide.onDidOpenTextDocument(debouncer.run),
      // An event that fires when a text document closes
      ide.onDidCloseTextDocument(debouncer.run),
      // An Event which fires when the active editor has changed. Note that the event also fires when the active editor changes to undefined.
      ide.onDidChangeActiveTextEditor(debouncer.run),
      // An Event which fires when the array of visible editors has changed.
      ide.onDidChangeVisibleTextEditors(debouncer.run),
      // An event that is emitted when a text document is changed. This usually happens when the contents changes but also when other things like the dirty-state changes.
      ide.onDidChangeTextDocument(debouncer.run),
      // An Event which fires when the selection in an editor has changed.
      ide.onDidChangeTextEditorSelection(debouncer.run),
      // An Event which fires when the visible ranges of an editor has changed.
      ide.onDidChangeTextEditorVisibleRanges(debouncer.run),
      // Re-draw hats on grapheme splitting algorithm change in case they
      // changed their token hat splitting setting.
      tokenGraphemeSplitter.registerAlgorithmChangeListener(debouncer.run),

      debouncer,
    );
  }

  /**
   * Allocate hats to the visible tokens.
   *
   * @param forceTokenHats If supplied, force the allocator to use these hats
   * for the given tokens. This is used for the tutorial, and for testing.
   * @param options Optionally supplies recorded assignments as allocation history.
   */
  async allocateHats(
    forceTokenHats?: TokenHat[],
    { initialHats }: HatAllocationOptions = {},
  ) {
    const activeMap = await this.context.getActiveMap();
    const oldTokenHats =
      initialHats == null
        ? activeMap.getStaleTokenHats()
        : this.restoreTokenHats(initialHats);

    // Forced graphemes won't have been normalized
    const normalizedForceTokenHats = forceTokenHats?.map((tokenHat) => ({
      ...tokenHat,
      grapheme: this.tokenGraphemeSplitter.normalizeGrapheme(tokenHat.grapheme),
    }));

    const tokenHats = this.hats.isEnabled
      ? allocateHats({
          ide: this.ide,
          tokenGraphemeSplitter: this.tokenGraphemeSplitter,
          enabledHatStyles: this.hats.enabledHatStyles,
          forceTokenHats: normalizedForceTokenHats,
          oldTokenHats,
          hatStability: this.ide.configuration.getOwnConfiguration(
            "experimental.hatStability",
          ),
          activeTextEditor: this.ide.activeTextEditor,
          visibleTextEditors: this.ide.visibleTextEditors,
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

  private restoreTokenHats({
    editor,
    hats,
  }: NonNullable<HatAllocationOptions["initialHats"]>): TokenHat[] {
    const tokens = getTokensInRange(this.ide, editor, editor.document.range);
    return hats.map((hat) => {
      const hatRange = plainObjectToRange(hat.hatRange);
      const token = tokens.find((token) => token.range.contains(hatRange));
      if (token == null) {
        throw new Error(
          `No token contains recorded hat at ${hatRange.concise()}`,
        );
      }
      return { ...hat, hatRange, token };
    });
  }

  dispose() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }
}
