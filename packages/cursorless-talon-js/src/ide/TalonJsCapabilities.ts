import type { Capabilities, CommandCapabilityMap } from "@cursorless/common";

const COMMAND_CAPABILITIES: CommandCapabilityMap = {
  clipboardCopy: { acceptsLocation: false },
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
  highlight: undefined,
  unfold: undefined,
  showReferences: undefined,
  insertLineAfter: undefined,
};

export class TalonJsCapabilities implements Capabilities {
  commands = COMMAND_CAPABILITIES;
}
