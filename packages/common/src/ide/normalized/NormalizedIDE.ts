import { GeneralizedRange } from "../../types/GeneralizedRange";
import { TextEditor } from "../../types/TextEditor";
import FakeClipboard from "../fake/FakeClipboard";
import FakeConfiguration from "../fake/FakeConfiguration";
import FakeGlobalState from "../fake/FakeGlobalState";
import FakeIDE from "../fake/FakeIDE";
import PassthroughIDEBase from "../PassthroughIDEBase";
import { FlashDescriptor } from "../types/FlashDescriptor";
import type { IDE } from "../types/ide.types";

export class NormalizedIDE extends PassthroughIDEBase {
  configuration: FakeConfiguration;
  globalState: FakeGlobalState;
  clipboard: FakeClipboard;

  constructor(
    original: IDE,
    private fakeIde: FakeIDE,
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
}
