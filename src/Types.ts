import * as vscode from "vscode";
import { SymbolColor } from "./constants";

/**
 * A token within a text editor, including the current display line of the token
 */
export interface Token {
  text: string;
  range: vscode.Range;
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
export type SymbolType = "class" | "function" | "symbol" | "namedFunction";
export type PieceType = "subtoken" | "character";

export interface SurroundingPairTransformation {
  type: "surroundingPair";
  delimiter: Delimiter;
  includePairDelimiter: boolean;
}
export interface ContainingSymbolDefinitionTransformation {
  type: "containingSymbolDefinition";
  symbolType: SymbolType;
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
  | ContainingSymbolDefinitionTransformation
  | SubpieceTransformation
  | MatchingPairSymbolTransformation
  | IdentityTransformation;

export type SelectionType = "character" | "token" | "line" | "block";
export type Position = "before" | "after" | "start" | "end" | "contents";

export interface PartialPrimitiveTarget {
  type: "primitive";
  mark?: Mark;
  transformation?: Transformation;
  selectionType?: SelectionType;
  position?: Position;
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
