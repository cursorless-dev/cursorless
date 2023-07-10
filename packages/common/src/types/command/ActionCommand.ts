import {
  PartialDestinationDescriptor,
  PartialTargetDescriptor,
} from "./PartialTargetDescriptor.types";

const simpleActionNames = [
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
  "outdentLine",
  "randomizeTargets",
  "remove",
  "rename",
  "replace",
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
  "toggleLineBreakpoint",
  "toggleLineComment",
  "unfoldRegion",
  "wrapWithSnippet",
] as const;

const complexActionNames = [
  "replaceWithTarget",
  "moveToTarget",
  "swapTargets",
  "pasteFromClipboard",
  "wrapWithPairedDelimiter",
] as const;

const actionNames = [...simpleActionNames, ...complexActionNames] as const;

export type SimpleActionName = (typeof simpleActionNames)[number];
export type ActionType = (typeof actionNames)[number];

export interface PartialSimpleActionDescriptor {
  name: SimpleActionName;
  target: PartialTargetDescriptor;
}

export interface PartialBringMoveActionDescriptor {
  name: "replaceWithTarget" | "moveToTarget";
  source: PartialTargetDescriptor;
  destination: PartialDestinationDescriptor;
}

export interface PartialSwapActionDescriptor {
  name: "swapTargets";
  target1: PartialTargetDescriptor;
  target2: PartialTargetDescriptor;
}

export interface PartialPasteActionDescriptor {
  name: "pasteFromClipboard";
  destination: PartialDestinationDescriptor;
}

export interface PartialWrapWithPairedDelimiterActionDescriptor {
  name: "wrapWithPairedDelimiter";
  left: string;
  right: string;
  target: PartialTargetDescriptor;
}

export type PartialActionDescriptor =
  | PartialSimpleActionDescriptor
  | PartialBringMoveActionDescriptor
  | PartialSwapActionDescriptor
  | PartialPasteActionDescriptor
  | PartialWrapWithPairedDelimiterActionDescriptor;
