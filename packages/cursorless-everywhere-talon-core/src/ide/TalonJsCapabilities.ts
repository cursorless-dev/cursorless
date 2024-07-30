import type { Capabilities, CommandCapabilityMap } from "@cursorless/common";

const COMMAND_CAPABILITIES: CommandCapabilityMap = {
  indentLine: { acceptsLocation: true },
  outdentLine: { acceptsLocation: true },

  clipboardCopy: undefined,
  clipboardPaste: undefined,
  toggleLineComment: undefined,
  rename: undefined,
  quickFix: undefined,
  revealDefinition: undefined,
  revealTypeDefinition: undefined,
  showHover: undefined,
  showDebugHover: undefined,
  extractVariable: undefined,
  fold: undefined,
  highlight: undefined,
  unfold: undefined,
  showReferences: undefined,
  insertLineAfter: undefined,
};

export class TalonJsCapabilities implements Capabilities {
  commands = COMMAND_CAPABILITIES;
}
