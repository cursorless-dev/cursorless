import type { Capabilities, CommandCapabilityMap } from "@cursorless/common";

const COMMAND_CAPABILITIES: CommandCapabilityMap = {
  clipboardPaste: true,
  clipboardCopy: { acceptsLocation: false },
  toggleLineComment: { acceptsLocation: false },
  indentLine: { acceptsLocation: false },
  outdentLine: { acceptsLocation: false },
  rename: { acceptsLocation: false },
  quickFix: { acceptsLocation: false },
  revealDefinition: { acceptsLocation: false },
  revealTypeDefinition: { acceptsLocation: false },
  showHover: { acceptsLocation: false },
  showDebugHover: { acceptsLocation: false },
  extractVariable: { acceptsLocation: false },
  fold: { acceptsLocation: true },
  highlight: { acceptsLocation: true },
  unfold: { acceptsLocation: true },
  showReferences: { acceptsLocation: false },
  insertLineAfter: { acceptsLocation: false },
  gitAccept: { acceptsLocation: false },
  gitRevert: { acceptsLocation: false },
  gitStage: { acceptsLocation: false },
  gitUnstage: { acceptsLocation: false },
};

export class VscodeCapabilities implements Capabilities {
  commands = COMMAND_CAPABILITIES;
}
