import FakeClipboard from "../fake/FakeClipboard";
import FakeConfiguration from "../fake/FakeConfiguration";
import FakeGlobalState from "../fake/FakeGlobalState";
import FakeIDE from "../fake/FakeIDE";
import PassthroughIDEBase from "../PassthroughIDEBase";
import type { IDE } from "../types/ide.types";

export default class NormalizedIDE extends PassthroughIDEBase {
  configuration: FakeConfiguration;
  globalState: FakeGlobalState;
  clipboard: FakeClipboard;

  constructor(original: IDE, fakeIde: FakeIDE, isSilent: boolean) {
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
}
