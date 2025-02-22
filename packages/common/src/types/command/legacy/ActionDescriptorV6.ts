import type {
  PartialTargetDescriptorV6,
  ScopeTypeV6,
} from "./PartialTargetDescriptorV6.types";
import type { DestinationDescriptorV6 } from "./DestinationDescriptorV6.types";

/**
 * A simple action takes only a single target and no other arguments.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const simpleActionNames = [
  "addSelection",
  "addSelectionAfter",
  "addSelectionBefore",
  "breakLine",
  "clearAndSetSelection",
  "copyToClipboard",
  "cutToClipboard",
  "decrement",
  "deselect",
  "editNewLineAfter",
  "editNewLineBefore",
  "experimental.setInstanceReference",
  "extractVariable",
  "findInDocument",
  "findInWorkspace",
  "flashTargets",
  "foldRegion",
  "followLink",
  "followLinkAside",
  "gitAccept",
  "gitRevert",
  "gitStage",
  "gitUnstage",
  "increment",
  "indentLine",
  "insertCopyAfter",
  "insertCopyBefore",
  "insertEmptyLineAfter",
  "insertEmptyLineBefore",
  "insertEmptyLinesAround",
  "joinLines",
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
  "private.getTargets",
  "private.setKeyboardTarget",
  "private.showParseTree",
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  "parsed",
] as const;

type SimpleActionName = (typeof simpleActionNames)[number];

/**
 * A simple action takes only a single target and no other arguments.
 */
interface SimpleActionDescriptor {
  name: SimpleActionName;
  target: PartialTargetDescriptorV6;
}

interface BringMoveActionDescriptor {
  name: "replaceWithTarget" | "moveToTarget";
  source: PartialTargetDescriptorV6;
  destination: DestinationDescriptorV6;
}

interface CallActionDescriptor {
  name: "callAsFunction";

  /**
   * The target to use as the function to be called.
   */
  callee: PartialTargetDescriptorV6;

  /**
   * The target to wrap in a function call.
   */
  argument: PartialTargetDescriptorV6;
}

interface SwapActionDescriptor {
  name: "swapTargets";
  target1: PartialTargetDescriptorV6;
  target2: PartialTargetDescriptorV6;
}

interface WrapWithPairedDelimiterActionDescriptor {
  name: "wrapWithPairedDelimiter" | "rewrapWithPairedDelimiter";
  left: string;
  right: string;
  target: PartialTargetDescriptorV6;
}

interface PasteActionDescriptor {
  name: "pasteFromClipboard";
  destination: DestinationDescriptorV6;
}

interface GenerateSnippetActionDescriptor {
  name: "generateSnippet";
  directory?: string;
  snippetName?: string;
  target: PartialTargetDescriptorV6;
}

interface NamedInsertSnippetArg {
  type: "named";
  name: string;
  substitutions?: Record<string, string>;
}

interface CustomInsertSnippetArg {
  type: "custom";
  body: string;
  languages?: string[];
  scopeTypes?: ScopeTypeV6[];
  substitutions?: Record<string, string>;
}

interface ListInsertSnippetArg {
  type: "list";
  substitutions?: Record<string, string>;
  snippets: CustomInsertSnippetArg[];
}

type InsertSnippetArg =
  | NamedInsertSnippetArg
  | CustomInsertSnippetArg
  | ListInsertSnippetArg;

interface InsertSnippetActionDescriptor {
  name: "insertSnippet";
  snippetDescription: InsertSnippetArg;
  destination: DestinationDescriptorV6;
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
  scopeType?: ScopeTypeV6;
  languages?: string[];
}

interface ListWrapWithSnippetArg {
  type: "list";
  snippets: CustomWrapWithSnippetArg[];
}

type WrapWithSnippetArg =
  | NamedWrapWithSnippetArg
  | CustomWrapWithSnippetArg
  | ListWrapWithSnippetArg;

interface WrapWithSnippetActionDescriptor {
  name: "wrapWithSnippet";
  snippetDescription: WrapWithSnippetArg;
  target: PartialTargetDescriptorV6;
}

interface ExecuteCommandOptions {
  commandArgs?: any[];
  ensureSingleEditor?: boolean;
  ensureSingleTarget?: boolean;
  restoreSelection?: boolean;
  showDecorations?: boolean;
}

interface ExecuteCommandActionDescriptor {
  name: "executeCommand";
  commandId: string;
  options?: ExecuteCommandOptions;
  target: PartialTargetDescriptorV6;
}

type ReplaceWith = string[] | { start: number };

interface ReplaceActionDescriptor {
  name: "replace";
  replaceWith: ReplaceWith;
  destination: DestinationDescriptorV6;
}

interface HighlightActionDescriptor {
  name: "highlight";
  highlightId?: string;
  target: PartialTargetDescriptorV6;
}

interface EditNewActionDescriptor {
  name: "editNew";
  destination: DestinationDescriptorV6;
}

interface GetTextActionOptions {
  showDecorations?: boolean;
  ensureSingleTarget?: boolean;
}

interface GetTextActionDescriptor {
  name: "getText";
  options?: GetTextActionOptions;
  target: PartialTargetDescriptorV6;
}

interface ParsedActionDescriptor {
  name: "parsed";
  content: string;
  arguments: unknown[];
}

export type ActionDescriptorV6 =
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
  | GetTextActionDescriptor
  | ParsedActionDescriptor;
