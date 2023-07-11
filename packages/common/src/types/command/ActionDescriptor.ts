import { HighlightId } from "../..";
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
  "experimental.setInstanceReference",
  "extractVariable",
  "findInWorkspace",
  "foldRegion",
  "followLink",
  "getText",
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
  "executeCommand",
  "generateSnippet",
  "highlight",
  "insertSnippet",
  "moveToTarget",
  "pasteFromClipboard",
  "replace",
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

export interface PartialCallActionDescriptor {
  name: "callAsFunction";
  callees: PartialTargetDescriptor;
  args: PartialTargetDescriptor;
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

export interface PartialGenerateSnippetActionDescriptor {
  name: "generateSnippet";
  snippetName?: string;
  target: PartialTargetDescriptor;
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

export interface ExecuteCommandOptions {
  commandArgs?: any[];
  ensureSingleEditor?: boolean;
  ensureSingleTarget?: boolean;
  restoreSelection?: boolean;
  showDecorations?: boolean;
}

export interface PartialExecuteCommandActionDescriptor {
  name: "executeCommand";
  commandId: string;
  options?: ExecuteCommandOptions;
  target: PartialTargetDescriptor;
}

export type ReplaceWith = string[] | { start: number };

export interface PartialReplaceActionDescriptor {
  name: "replace";
  replaceWith: ReplaceWith;
  target: PartialTargetDescriptor;
}

export interface PartialHighlightActionDescriptor {
  name: "highlight";
  highlightId?: HighlightId;
  target: PartialTargetDescriptor;
}

export type PartialActionDescriptor =
  | PartialSimpleActionDescriptor
  | PartialBringMoveActionDescriptor
  | PartialSwapActionDescriptor
  | PartialCallActionDescriptor
  | PartialWrapWithPairedDelimiterActionDescriptor
  | PartialPasteActionDescriptor
  | PartialGenerateSnippetActionDescriptor
  | PartialInsertSnippetActionDescriptor
  | PartialWrapSnippetActionDescriptor
  | PartialExecuteCommandActionDescriptor
  | PartialReplaceActionDescriptor
  | PartialHighlightActionDescriptor;
