import { getFixturePath } from "../../index";
import type { GeneralizedRange } from "../../types/GeneralizedRange";
import type { TextEditor } from "../../types/TextEditor";
import type FakeClipboard from "../fake/FakeClipboard";
import type FakeConfiguration from "../fake/FakeConfiguration";
import type FakeGlobalState from "../fake/FakeGlobalState";
import type FakeIDE from "../fake/FakeIDE";
import PassthroughIDEBase from "../PassthroughIDEBase";
import type { FlashDescriptor } from "../types/FlashDescriptor";
import type { IDE } from "../types/ide.types";
import type { QuickPickOptions } from "../types/QuickPickOptions";

export class NormalizedIDE extends PassthroughIDEBase {
  configuration: FakeConfiguration;
  globalState: FakeGlobalState;
  clipboard: FakeClipboard;

  constructor(
    original: IDE,
    public fakeIde: FakeIDE,
    private isSilent: boolean,
  ) {
    super(original);

    this.messages = isSilent ? fakeIde.messages : original.messages;
    this.configuration = fakeIde.configuration;
    this.globalState = fakeIde.globalState;
    this.clipboard = fakeIde.clipboard;

    this.initializeConfiguration();
  }

  private initializeConfiguration() {
    this.configuration.mockConfigurationScope(
      { languageId: "css" },
      { wordSeparators: ["_", "-"] },
      true,
    );
    this.configuration.mockConfigurationScope(
      { languageId: "scss" },
      { wordSeparators: ["_", "-"] },
      true,
    );
    this.configuration.mockConfigurationScope(
      { languageId: "shellscript" },
      { wordSeparators: ["_", "-"] },
      true,
    );
    this.configuration.mockConfiguration("experimental", {
      hatStability: this.configuration.getOwnConfiguration(
        "experimental.hatStability",
      ),
      snippetsDir: getFixturePath("cursorless-snippets"),
    });
  }

  flashRanges(flashDescriptors: FlashDescriptor[]): Promise<void> {
    return this.isSilent
      ? this.fakeIde.flashRanges(flashDescriptors)
      : super.flashRanges(flashDescriptors);
  }

  setHighlightRanges(
    highlightId: string | undefined,
    editor: TextEditor,
    ranges: GeneralizedRange[],
  ): Promise<void> {
    return this.isSilent
      ? this.fakeIde.setHighlightRanges(highlightId, editor, ranges)
      : super.setHighlightRanges(highlightId, editor, ranges);
  }

  public async showQuickPick(
    _items: readonly string[],
    _options?: QuickPickOptions,
  ): Promise<string | undefined> {
    return this.isSilent
      ? this.fakeIde.showQuickPick(_items, _options)
      : super.showQuickPick(_items, _options);
  }
}
