import {
  PartialTargetDescriptor,
  ScopeType,
} from "./PartialTargetDescriptor.types";
import { DestinationDescriptor } from "./DestinationDescriptor.types";

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

/**
 * A simple action takes only a single target and no other arguments.
 */
export interface PartialSimpleActionDescriptor {
  name: SimpleActionName;
  target: PartialTargetDescriptor;
}

export interface PartialBringMoveActionDescriptor {
  name: "replaceWithTarget" | "moveToTarget";
  source: PartialTargetDescriptor;
  destination: DestinationDescriptor;
}

export interface PartialCallActionDescriptor {
  name: "callAsFunction";

  /**
   * The target to use as the function to be called.
   */
  callee: PartialTargetDescriptor;

  /**
   * The target to wrap in a function call.
   */
  argument: PartialTargetDescriptor;
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
  destination: DestinationDescriptor;
}

export interface PartialGenerateSnippetActionDescriptor {
  name: "generateSnippet";
  snippetName?: string;
  target: PartialTargetDescriptor;
}

interface NamedInsertSnippetArg {
  type: "named";
  name: string;
  substitutions?: Record<string, string>;
}
interface CustomInsertSnippetArg {
  type: "custom";
  body: string;
  scopeType?: ScopeType;
  substitutions?: Record<string, string>;
}
export type InsertSnippetArg = NamedInsertSnippetArg | CustomInsertSnippetArg;

export interface PartialInsertSnippetActionDescriptor {
  name: "insertSnippet";
  snippetDescription: InsertSnippetArg;
  destination: DestinationDescriptor;
}

interface NamedWrapWithSnippetArg {
  type: "named";
  name: string;
  variableName: string;
}
interface CustomWrapWithSnippetArg {
  type: "custom";
  body: string;
  variableName?: string;
  scopeType?: ScopeType;
}
export type WrapWithSnippetArg =
  | NamedWrapWithSnippetArg
  | CustomWrapWithSnippetArg;

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
  destination: DestinationDescriptor;
}

export interface PartialHighlightActionDescriptor {
  name: "highlight";
  highlightId?: string;
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
