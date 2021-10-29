import { SyntaxNode } from "web-tree-sitter";
import * as vscode from "vscode";
import { ExtensionContext, Location, Selection } from "vscode";
import { HatStyleName } from "../core/constants";
import { EditStyles } from "../core/editStyles";
import NavigationMap from "../core/NavigationMap";
import { Snippets } from "../core/Snippets";
import { SelectionUpdater } from "../core/updateSelections/SelectionUpdater";

/**
 * A token within a text editor, including the current display line of the token
 */
export interface Token {
  text: string;
  range: vscode.Range;
  startOffset: number;
  endOffset: number;
  editor: vscode.TextEditor;
  displayLine: number;
}

export interface CursorMark {
  type: "cursor";
}

export interface CursorMarkToken {
  type: "cursorToken";
}

export interface That {
  type: "that";
}

export interface Source {
  type: "source";
}

export interface LastCursorPosition {
  type: "lastCursorPosition";
}

export interface DecoratedSymbol {
  type: "decoratedSymbol";
  symbolColor: HatStyleName;
  character: string;
}

export interface LineNumberPosition {
  lineNumber: number;
  isRelative: boolean;
}
export interface LineNumber {
  type: "lineNumber";
  anchor: LineNumberPosition;
  active: LineNumberPosition;
}

export type Mark =
  | CursorMark
  | CursorMarkToken
  | That
  | Source
  //   | LastCursorPosition Not implemented yet
  | DecoratedSymbol
  | LineNumber;
export type Delimiter =
  | "angleBrackets"
  | "backtickQuotes"
  | "curlyBrackets"
  | "doubleQuotes"
  | "escapedSingleQuotes"
  | "escapedDoubleQuotes"
  | "parentheses"
  | "singleQuotes"
  | "squareBrackets"
  | "whitespace";

export type ScopeType =
  | "argumentOrParameter"
  | "anonymousFunction"
  | "attribute"
  | "class"
  | "className"
  | "collectionItem"
  | "collectionKey"
  | "comment"
  | "functionCall"
  | "functionName"
  | "ifStatement"
  | "list"
  | "map"
  | "name"
  | "namedFunction"
  | "regularExpression"
  | "statement"
  | "string"
  | "type"
  | "value"
  | "xmlBothTags"
  | "xmlElement"
  | "xmlEndTag"
  | "xmlStartTag";
export type SubTokenType = "word" | "character";

export interface SurroundingPairModifier {
  type: "surroundingPair";
  delimiter: Delimiter | null;
  delimitersOnly: boolean;
}
export interface ContainingScopeModifier {
  type: "containingScope";
  scopeType: ScopeType;
  valueOnly?: boolean;
  includeSiblings?: boolean;
}
export interface SubTokenModifier {
  type: "subpiece";
  pieceType: SubTokenType;
  anchor: number;
  active: number;
  excludeAnchor?: boolean;
  excludeActive?: boolean;
}
export interface MatchingPairSymbolModifier {
  type: "matchingPairSymbol";
}
export interface IdentityModifier {
  type: "identity";
}
export interface HeadModifier {
  type: "head";
}
export interface TailModifier {
  type: "tail";
}

export type Modifier =
  | IdentityModifier
  | SurroundingPairModifier
  | ContainingScopeModifier
  | SubTokenModifier
  //   | MatchingPairSymbolModifier Not implemented
  | HeadModifier
  | TailModifier;

export type SelectionType =
  //   | "character" Not implemented
  "token" | "line" | "notebookCell" | "paragraph" | "document";
export type Position = "before" | "after" | "contents";
export type InsideOutsideType = "inside" | "outside" | null;

export interface PartialPrimitiveTarget {
  type: "primitive";
  mark?: Mark;
  modifier?: Modifier;
  selectionType?: SelectionType;
  position?: Position;
  insideOutsideType?: InsideOutsideType;
}

export interface PartialRangeTarget {
  type: "range";
  start: PartialPrimitiveTarget;
  end: PartialPrimitiveTarget;
  excludeStart?: boolean;
  excludeEnd?: boolean;
}

export interface PartialListTarget {
  type: "list";
  elements: (PartialPrimitiveTarget | PartialRangeTarget)[];
}

export type PartialTarget =
  | PartialPrimitiveTarget
  | PartialRangeTarget
  | PartialListTarget;

export interface PrimitiveTarget {
  type: "primitive";
  mark: Mark;
  modifier: Modifier;
  selectionType: SelectionType;
  position: Position;
  insideOutsideType: InsideOutsideType;
}

export interface RangeTarget {
  type: "range";
  anchor: PrimitiveTarget;
  active: PrimitiveTarget;
  excludeAnchor: boolean;
  excludeActive: boolean;
}

export interface ListTarget {
  type: "list";
  elements: (PrimitiveTarget | RangeTarget)[];
}

export type Target = PrimitiveTarget | RangeTarget | ListTarget;

export interface ProcessedTargetsContext {
  currentSelections: SelectionWithEditor[];
  currentEditor: vscode.TextEditor | undefined;
  navigationMap: NavigationMap;
  thatMark: SelectionWithEditor[];
  sourceMark: SelectionWithEditor[];
  getNodeAtLocation: (location: Location) => SyntaxNode;
}

export interface SelectionWithEditor {
  selection: vscode.Selection;
  editor: vscode.TextEditor;
}

export interface SelectionContext {
  isInDelimitedList?: boolean;
  containingListDelimiter?: string | null;

  /**
   * Selection used for outside selection
   */
  outerSelection?: vscode.Selection | null;

  /**
   * The range of the delimiter before the selection
   */
  leadingDelimiterRange?: vscode.Range | null;

  /**
   * The range of the delimiter after the selection
   */
  trailingDelimiterRange?: vscode.Range | null;

  isNotebookCell?: boolean;
}

export interface TypedSelection {
  /**
   * The selection.  If insideOutsideType is non-null, it will be adjusted to
   * include delimiter if outside
   */
  selection: SelectionWithEditor;
  selectionType: SelectionType;
  selectionContext: SelectionContext;

  /**
   * Is a boolean if user specifically requested inside or outside
   */
  insideOutsideType: InsideOutsideType;

  /**
   * Mirrored from the target from which this selection was constructed
   */
  position: Position;
}

export interface ActionPreferences {
  position?: Position;
  insideOutsideType: InsideOutsideType;
  selectionType?: SelectionType;
  modifier?: Modifier;
}

export interface SelectionWithContext {
  selection: vscode.Selection;
  context: SelectionContext;
}

export interface ActionReturnValue {
  returnValue?: any;
  thatMark?: SelectionWithEditor[];
  sourceMark?: SelectionWithEditor[];
}

export interface Action {
  run(targets: TypedSelection[][], ...args: any[]): Promise<ActionReturnValue>;

  /**
   * Used to define default values for parts of target during inference.
   * @param args Extra args to command
   */
  getTargetPreferences(...args: any[]): ActionPreferences[];
}

export type ActionType =
  | "callAsFunction"
  | "clearAndSetSelection"
  | "copyToClipboard"
  | "cutToClipboard"
  | "editNewLineAfter"
  | "editNewLineBefore"
  | "extractVariable"
  | "findInWorkspace"
  | "foldRegion"
  | "getText"
  | "indentLine"
  | "insertCopyAfter"
  | "insertCopyBefore"
  | "insertEmptyLineAfter"
  | "insertEmptyLineBefore"
  | "insertEmptyLinesAround"
  | "moveToTarget"
  | "outdentLine"
  | "pasteFromClipboard"
  | "remove"
  | "replace"
  | "replaceWithTarget"
  | "reverseTargets"
  | "scrollToBottom"
  | "scrollToCenter"
  | "scrollToTop"
  | "setSelection"
  | "setSelectionAfter"
  | "setSelectionBefore"
  | "sortTargets"
  | "swapTargets"
  | "toggleLineBreakpoint"
  | "toggleLineComment"
  | "unfoldRegion"
  | "wrapWithPairedDelimiter"
  | "wrapWithSnippet";

export type ActionRecord = Record<ActionType, Action>;

export interface Graph {
  readonly actions: ActionRecord;
  readonly editStyles: EditStyles;
  readonly navigationMap: NavigationMap;
  readonly extensionContext: ExtensionContext;
  readonly snippets: Snippets;
  readonly selectionUpdater: SelectionUpdater;
}

export type NodeMatcherValue = {
  node: SyntaxNode;
  selection: SelectionWithContext;
};

export type NodeMatcherAlternative = NodeMatcher | string[] | string;

export type NodeMatcher = (
  selection: SelectionWithEditor,
  node: SyntaxNode
) => NodeMatcherValue[] | null;

/**
 * Returns the desired relative of the provided node.
 * Returns null if matching node not found.
 **/
export type NodeFinder = (
  node: SyntaxNode,
  selection?: vscode.Selection
) => SyntaxNode | null;

/** Returns one or more selections for a given SyntaxNode */
export type SelectionExtractor = (
  editor: vscode.TextEditor,
  nodes: SyntaxNode
) => SelectionWithContext;

/** Represent a single edit/change in the document */
export interface Edit {
  range: vscode.Range;
  text: string;
  isReplace?: boolean;
}
