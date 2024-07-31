import { Capabilities } from "../types/Capabilities";

export class FakeCapabilities implements Capabilities {
  commands = {
    clipboardPaste: undefined,
    clipboardCopy: undefined,
    toggleLineComment: undefined,
    indentLine: undefined,
    outdentLine: undefined,
    rename: undefined,
    quickFix: undefined,
    revealDefinition: undefined,
    revealTypeDefinition: undefined,
    showHover: undefined,
    showDebugHover: undefined,
    extractVariable: undefined,
    fold: undefined,
    highlight: { acceptsLocation: true },
    unfold: undefined,
    showReferences: undefined,
    insertLineAfter: undefined,
  };
}
