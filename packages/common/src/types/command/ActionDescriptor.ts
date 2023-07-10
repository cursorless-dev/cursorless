import {
  PartialDestinationDescriptor,
  PartialTargetDescriptor,
  ScopeType,
} from "./PartialTargetDescriptor.types";

const simpleActionNames = [
  "clearAndSetSelection",
  "copyToClipboard",
  "cutToClipboard",
  "deselect",
  "editNewLineAfter",
  "editNewLineBefore",
  "executeCommand",
  "experimental.setInstanceReference",
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
  "outdentLine",
  "randomizeTargets",
  "remove",
  "rename",
  "replace",
  "revealDefinition",
  "revealTypeDefinition",
  "reverseTargets",
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
] as const;

const complexActionNames = [
  "callAsFunction",
  "editNew",
  "insertSnippet",
  "moveToTarget",
  "pasteFromClipboard",
  "replaceWithTarget",
  "rewrapWithPairedDelimiter",
  "swapTargets",
  "wrapWithPairedDelimiter",
  "wrapWithSnippet",
] as const;

export const actionNames = [
  ...simpleActionNames,
  ...complexActionNames,
] as const;

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

export interface PartialWrapWithPairedDelimiterActionDescriptor {
  name: "wrapWithPairedDelimiter" | "rewrapWithPairedDelimiter";
  left: string;
  right: string;
  target: PartialTargetDescriptor;
}

export interface PartialPasteActionDescriptor {
  name: "pasteFromClipboard";
  destination: PartialDestinationDescriptor;
}

interface NamedSnippetArg {
  type: "named";
  name: string;
  substitutions?: Record<string, string>;
}
interface CustomSnippetArg {
  type: "custom";
  body: string;
  scopeType?: ScopeType;
  substitutions?: Record<string, string>;
}
export type InsertSnippetArg = NamedSnippetArg | CustomSnippetArg;

export interface PartialInsertSnippetActionDescriptor {
  name: "insertSnippet";
  snippetDescription: InsertSnippetArg;
  target: PartialTargetDescriptor;
}

interface NamedSnippetArg {
  type: "named";
  name: string;
  variableName: string;
}
interface CustomSnippetArg {
  type: "custom";
  body: string;
  variableName?: string;
  scopeType?: ScopeType;
}
export type WrapWithSnippetArg = NamedSnippetArg | CustomSnippetArg;

export interface PartialWrapSnippetActionDescriptor {
  name: "wrapWithSnippet";
  snippetDescription: WrapWithSnippetArg;
  target: PartialTargetDescriptor;
}

export type PartialActionDescriptor =
  | PartialSimpleActionDescriptor
  | PartialBringMoveActionDescriptor
  | PartialSwapActionDescriptor
  | PartialWrapWithPairedDelimiterActionDescriptor
  | PartialPasteActionDescriptor
  | PartialInsertSnippetActionDescriptor
  | PartialWrapSnippetActionDescriptor;
