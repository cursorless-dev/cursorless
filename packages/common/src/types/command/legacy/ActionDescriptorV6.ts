import type {
  PartialTargetDescriptor,
  ScopeType,
} from "../PartialTargetDescriptor.types";
import type { DestinationDescriptor } from "../DestinationDescriptor.types";

/**
 * A simple action takes only a single target and no other arguments.
 */
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
  "foldRegion",
  "followLink",
  "followLinkAside",
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

const actionNames = [...simpleActionNames, ...complexActionNames] as const;

type SimpleActionName = (typeof simpleActionNames)[number];
type ActionType = (typeof actionNames)[number];

/**
 * A simple action takes only a single target and no other arguments.
 */
interface SimpleActionDescriptor {
  name: SimpleActionName;
  target: PartialTargetDescriptor;
}

interface BringMoveActionDescriptor {
  name: "replaceWithTarget" | "moveToTarget";
  source: PartialTargetDescriptor;
  destination: DestinationDescriptor;
}

interface CallActionDescriptor {
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

interface SwapActionDescriptor {
  name: "swapTargets";
  target1: PartialTargetDescriptor;
  target2: PartialTargetDescriptor;
}

interface WrapWithPairedDelimiterActionDescriptor {
  name: "wrapWithPairedDelimiter" | "rewrapWithPairedDelimiter";
  left: string;
  right: string;
  target: PartialTargetDescriptor;
}

interface PasteActionDescriptor {
  name: "pasteFromClipboard";
  destination: DestinationDescriptor;
}

interface GenerateSnippetActionDescriptor {
  name: "generateSnippet";
  dirPath?: string;
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
  scopeTypes?: ScopeType[];
  substitutions?: Record<string, string>;
}
type InsertSnippetArg = NamedInsertSnippetArg | CustomInsertSnippetArg;

interface InsertSnippetActionDescriptor {
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
type WrapWithSnippetArg = NamedWrapWithSnippetArg | CustomWrapWithSnippetArg;

interface WrapWithSnippetActionDescriptor {
  name: "wrapWithSnippet";
  snippetDescription: WrapWithSnippetArg;
  target: PartialTargetDescriptor;
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
  target: PartialTargetDescriptor;
}

type ReplaceWith = string[] | { start: number };

interface ReplaceActionDescriptor {
  name: "replace";
  replaceWith: ReplaceWith;
  destination: DestinationDescriptor;
}

interface HighlightActionDescriptor {
  name: "highlight";
  highlightId?: string;
  target: PartialTargetDescriptor;
}

interface EditNewActionDescriptor {
  name: "editNew";
  destination: DestinationDescriptor;
}

interface GetTextActionOptions {
  showDecorations?: boolean;
  ensureSingleTarget?: boolean;
}

interface GetTextActionDescriptor {
  name: "getText";
  options?: GetTextActionOptions;
  target: PartialTargetDescriptor;
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
