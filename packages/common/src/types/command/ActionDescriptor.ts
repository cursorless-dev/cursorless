import {
  PartialTargetDescriptor,
  ScopeType,
} from "./PartialTargetDescriptor.types";
import { DestinationDescriptor } from "./DestinationDescriptor.types";

/**
 * A simple action takes only a single target and no other arguments.
 */
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
  "getText",
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
export interface SimpleActionDescriptor {
  name: SimpleActionName;
  target: PartialTargetDescriptor;
}

export interface BringMoveActionDescriptor {
  name: "replaceWithTarget" | "moveToTarget";
  source: PartialTargetDescriptor;
  destination: DestinationDescriptor;
}

export interface CallActionDescriptor {
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

export interface SwapActionDescriptor {
  name: "swapTargets";
  target1: PartialTargetDescriptor;
  target2: PartialTargetDescriptor;
}

export interface WrapWithPairedDelimiterActionDescriptor {
  name: "wrapWithPairedDelimiter" | "rewrapWithPairedDelimiter";
  left: string;
  right: string;
  target: PartialTargetDescriptor;
}

export interface PasteActionDescriptor {
  name: "pasteFromClipboard";
  destination: DestinationDescriptor;
}

export interface GenerateSnippetActionDescriptor {
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

export interface InsertSnippetActionDescriptor {
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

export interface WrapWithSnippetActionDescriptor {
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

export interface ExecuteCommandActionDescriptor {
  name: "executeCommand";
  commandId: string;
  options?: ExecuteCommandOptions;
  target: PartialTargetDescriptor;
}

export type ReplaceWith = string[] | { start: number };

export interface ReplaceActionDescriptor {
  name: "replace";
  replaceWith: ReplaceWith;
  destination: DestinationDescriptor;
}

export interface HighlightActionDescriptor {
  name: "highlight";
  highlightId?: string;
  target: PartialTargetDescriptor;
}

export interface EditNewActionDescriptor {
  name: "editNew";
  destination: DestinationDescriptor;
}

export interface GetTextActionOptions {
  showDecorations?: boolean;
  ensureSingleTarget?: boolean;
}

export interface GetTextActionDescriptor {
  name: "getText";
  options?: GetTextActionOptions;
  target: PartialTargetDescriptor;
}

export type ActionDescriptor =
  | SimpleActionDescriptor
  | BringMoveActionDescriptor
  | SwapActionDescriptor
  | CallActionDescriptor
  | PasteActionDescriptor
  | ExecuteCommandActionDescriptor
  | ReplaceActionDescriptor
  | HighlightActionDescriptor
  | GenerateSnippetActionDescriptor
  | InsertSnippetActionDescriptor
  | WrapWithSnippetActionDescriptor
  | WrapWithPairedDelimiterActionDescriptor
  | EditNewActionDescriptor
  | GetTextActionDescriptor;
