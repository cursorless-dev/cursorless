import type { Capabilities, CommandCapabilityMap } from "@cursorless/common";
import { nodeGetRunMode } from "@cursorless/node-common";
import * as semver from "semver";
import * as vscode from "vscode";

// FIXME: In newer versions of vscode the `editor.action.clipboardCopyAction`
// command appears to be disabled / sandboxed in test mode.
const supportsCopy =
  nodeGetRunMode() !== "test" || semver.lt(vscode.version, "1.98.0");

const COMMAND_CAPABILITIES: CommandCapabilityMap = {
  clipboardCopy: supportsCopy ? { acceptsLocation: false } : undefined,
  clipboardPaste: true,
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
