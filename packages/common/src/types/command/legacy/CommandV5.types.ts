import { PartialTargetDescriptorV5 } from "./PartialTargetDescriptorV5.types";

const actionNames = [
  "callAsFunction",
  "clearAndSetSelection",
  "copyToClipboard",
  "cutToClipboard",
  "deselect",
  "editNew",
  "editNewLineAfter",
  "editNewLineBefore",
  "executeCommand",
  "extractVariable",
  "findInWorkspace",
  "foldRegion",
  "followLink",
  "generateSnippet",
  "getText",
  "highlight",
  "indentLine",
  "insertCopyAfter",
  "insertCopyBefore",
  "insertEmptyLineAfter",
  "insertEmptyLineBefore",
  "insertEmptyLinesAround",
  "insertSnippet",
  "moveToTarget",
  "outdentLine",
  "pasteFromClipboard",
  "randomizeTargets",
  "remove",
  "rename",
  "replace",
  "replaceWithTarget",
  "revealDefinition",
  "revealTypeDefinition",
  "reverseTargets",
  "rewrapWithPairedDelimiter",
  "experimental.setInstanceReference",
  "scrollToBottom",
  "scrollToCenter",
  "scrollToTop",
  "setSelection",
  "setSelectionAfter",
  "setSelectionBefore",
  "showDebugHover",
  "showHover",
  "showQuickFix",
  "showReferences",
  "sortTargets",
  "swapTargets",
  "toggleLineBreakpoint",
  "toggleLineComment",
  "unfoldRegion",
  "wrapWithPairedDelimiter",
  "wrapWithSnippet",
] as const;

type ActionType = (typeof actionNames)[number];

interface ActionCommand {
  /**
   * The action to run
   */
  name: ActionType;

  /**
   * A list of arguments expected by the given action.
   */
  args?: unknown[];
}

export interface CommandV5 {
  /**
   * The version number of the command API
   */
  version: 5;

  /**
   * The spoken form of the command if issued from a voice command system
   */
  spokenForm?: string;

  /**
   * If the command is issued from a voice command system, this boolean indicates
   * whether we should use the pre phrase snapshot. Only set this to true if the
   * voice command system issues a pre phrase signal at the start of every
   * phrase.
   */
  usePrePhraseSnapshot: boolean;

  action: ActionCommand;

  /**
   * A list of targets expected by the action. Inference will be run on the
   * targets
   */
  targets: PartialTargetDescriptorV5[];
}
