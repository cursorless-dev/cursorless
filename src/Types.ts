import { SyntaxNode } from "tree-sitter";
import * as vscode from "vscode";
import { Location } from "vscode";
import { SymbolColor } from "./constants";
import NavigationMap from "./NavigationMap";

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

export interface LastEditRange {
  type: "lastEditRange";
}

export interface LastCursorPosition {
  type: "lastCursorPosition";
}

export interface DecoratedSymbol {
  type: "decoratedSymbol";
  symbolColor: SymbolColor;
  character: string;
}

export type Mark =
  | CursorMark
  | LastEditRange
  | LastCursorPosition
  | DecoratedSymbol;
export type Delimiter =
  | "squareBrackets"
  | "curlyBrackets"
  | "angleBrackets"
  | "parentheses"
  | "singleQuotes"
  | "doubleQuotes";
export type ScopeType =
  | "class"
  | "arrowFunction"
  | "namedFunction"
  | "pair"
  | "ifStatement";
export type PieceType = "subtoken" | "character";

export interface SurroundingPairTransformation {
  type: "surroundingPair";
  delimiter: Delimiter;
}
export interface ContainingScopeTransformation {
  type: "containingScope";
  scopeType: ScopeType;
  valueOnly?: boolean;
}
export interface SubpieceTransformation {
  type: "subpiece";
  pieceType: PieceType;
  startIndex: number;
  endIndex: number;
}
export interface MatchingPairSymbolTransformation {
  type: "matchingPairSymbol";
}
export interface IdentityTransformation {
  type: "identity";
}

export type Transformation =
  | SurroundingPairTransformation
  | ContainingScopeTransformation
  | SubpieceTransformation
  | MatchingPairSymbolTransformation
  | IdentityTransformation;

export type SelectionType = "character" | "token" | "line" | "block";
export type Position = "before" | "after" | "contents";
export type InsideOutsideType = "inside" | "outside" | null;

export interface PartialPrimitiveTarget {
  type: "primitive";
  mark?: Mark;
  transformation?: Transformation;
  selectionType?: SelectionType;
  position?: Position;
  insideOutsideType?: InsideOutsideType;
}

export interface PartialRangeTarget {
  type: "range";
  start: PartialPrimitiveTarget;
  end: PartialPrimitiveTarget;
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
  transformation: Transformation;
  selectionType: SelectionType;
  position: Position;
  insideOutsideType: InsideOutsideType;
}

export interface RangeTarget {
  type: "range";
  start: PrimitiveTarget;
  end: PrimitiveTarget;
}

export interface ListTarget {
  type: "list";
  elements: (PrimitiveTarget | RangeTarget)[];
}

export type Target = PrimitiveTarget | RangeTarget | ListTarget;

export interface InferenceContext {
  selectionContents: string[];
  clipboardContents?: string;
  isPaste: boolean;
}

export interface ProcessedTargetsContext {
  currentSelections: SelectionWithEditor[];
  currentEditor: vscode.TextEditor | undefined;
  navigationMap: NavigationMap;
  lastCursorPosition: vscode.Selection[];
  getNodeAtLocation: (location: Location) => SyntaxNode;
}

export interface SelectionWithEditor {
  selection: vscode.Selection;
  editor: vscode.TextEditor;
}

export interface SelectionContext {
  isInDelimitedList?: boolean;
  containingListDelimiter?: string;

  /**
   * The range of the delimiter before the selection, *if* the selection has a
   * preceding sibling, else null
   */
  leadingDelimiterRange?: vscode.Range | null;

  /**
   * The range of the delimiter after the selection, *if* the selection has a
   * following sibling, else null
   */
  trailingDelimiterRange?: vscode.Range | null;
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
}

export interface ActionPreferences {
  position?: Position;
  insideOutsideType?: InsideOutsideType;
}
