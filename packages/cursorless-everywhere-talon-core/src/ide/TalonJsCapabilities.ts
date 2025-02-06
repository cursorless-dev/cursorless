import type { Capabilities, CommandCapabilityMap } from "@cursorless/common";

const COMMAND_CAPABILITIES: CommandCapabilityMap = {
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
  indentLine: undefined,
  outdentLine: undefined,
  gitAccept: undefined,
  gitRevert: undefined,
  gitStage: undefined,
  gitUnstage: undefined,
};

export class TalonJsCapabilities implements Capabilities {
  commands = COMMAND_CAPABILITIES;
}
