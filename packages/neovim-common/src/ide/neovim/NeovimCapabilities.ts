import { Capabilities, CommandCapabilityMap } from "@cursorless/common";

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
  highlight: { acceptsLocation: true },
  unfold: undefined,
  showReferences: undefined,
};

export class NeovimCapabilities implements Capabilities {
  commands = COMMAND_CAPABILITIES;
}
