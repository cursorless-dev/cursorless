import { HatStyleName } from "../core/constants";

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

export interface Nothing {
  type: "nothing";
}

export interface LastCursorPosition {
  type: "lastCursorPosition";
}

export interface DecoratedSymbol {
  type: "decoratedSymbol";
  symbolColor: HatStyleName;
  character: string;
}

export type LineNumberType = "absolute" | "relative" | "modulo100";

export interface LineNumberPosition {
  type: LineNumberType;
  lineNumber: number;
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
  | Nothing
  | LineNumber;

export type SimpleSurroundingPairName =
  | "angleBrackets"
  | "backtickQuotes"
  | "curlyBrackets"
  | "doubleQuotes"
  | "escapedDoubleQuotes"
  | "escapedParentheses"
  | "escapedSquareBrackets"
  | "escapedSingleQuotes"
  | "parentheses"
  | "singleQuotes"
  | "squareBrackets";
export type ComplexSurroundingPairName = "string" | "any";
export type SurroundingPairName =
  | SimpleSurroundingPairName
  | ComplexSurroundingPairName;

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
  | "condition"
  | "section"
  | "sectionLevelOne"
  | "sectionLevelTwo"
  | "sectionLevelThree"
  | "sectionLevelFour"
  | "sectionLevelFive"
  | "sectionLevelSix"
  | "selector"
  | "xmlBothTags"
  | "xmlElement"
  | "xmlEndTag"
  | "xmlStartTag"
  // Text based scopes
  //   | "character" Not implemented
  | "token"
  | "line"
  | "notebookCell"
  | "paragraph"
  | "document"
  | "nonWhitespaceSequence"
  | "url";

export type SubTokenType = "word" | "character";

/**
 * Indicates whether to include or exclude delimiters in a surrounding pair
 * modifier. In the future, these will become proper modifiers that can be
 * applied in many places, such as to restrict to the body of an if statement.
 * By default, a surrounding pair modifier refers to the entire surrounding
 * range, so if delimiter inclusion is undefined, it's equivalent to not having
 * one of these modifiers; ie include the delimiters.
 */
export type DelimiterInclusion = "excludeInterior" | "interiorOnly" | undefined;

export type SurroundingPairDirection = "left" | "right";
export interface SurroundingPairModifier {
  type: "surroundingPair";
  delimiter: SurroundingPairName;
  delimiterInclusion: DelimiterInclusion;
  forceDirection?: SurroundingPairDirection;
}

export interface ContainingScopeModifier {
  type: "containingScope";
  scopeType: ScopeType;
}

export interface EveryScopeModifier {
  type: "everyScope";
  scopeType: ScopeType;
}

export interface SubTokenModifier {
  type: "subpiece";
  pieceType: SubTokenType;
  anchor: number;
  active: number;
  excludeAnchor?: boolean;
  excludeActive?: boolean;
}

/**
 * Converts its input to a raw selection with no type information so for
 * example if it is the destination of a bring or move it should inherit the
 * type information such as delimiters from its source.
 */
export interface RawSelectionModifier {
  type: "toRawSelection";
}

export interface HeadModifier {
  type: "head";
}

export interface TailModifier {
  type: "tail";
}

export type Position = "before" | "after" | "start" | "end";

export interface PositionModifier {
  type: "position";
  position: Position;
}

export interface PartialPrimitiveTarget {
  type: "primitive";
  mark?: Mark;
  modifiers?: Modifier[];
  isImplicit?: boolean;
}

export type Modifier =
  | PositionModifier
  | SurroundingPairModifier
  | ContainingScopeModifier
  | EveryScopeModifier
  | SubTokenModifier
  | HeadModifier
  | TailModifier
  | RawSelectionModifier;

export interface PartialRangeTarget {
  type: "range";
  anchor: PartialPrimitiveTarget;
  active: PartialPrimitiveTarget;
  excludeStart?: boolean;
  excludeEnd?: boolean;
  rangeType?: RangeType;
}

export interface PartialListTarget {
  type: "list";
  elements: (PartialPrimitiveTarget | PartialRangeTarget)[];
}

export type PartialTarget =
  | PartialPrimitiveTarget
  | PartialRangeTarget
  | PartialListTarget;

export interface PrimitiveTarget extends PartialPrimitiveTarget {
  isImplicit: boolean;
  mark: Mark;
  modifiers: Modifier[];
}

export interface RangeTarget {
  type: "range";
  anchor: PrimitiveTarget;
  active: PrimitiveTarget;
  excludeAnchor: boolean;
  excludeActive: boolean;
  rangeType: RangeType;
}

// continuous is one single continuous selection between the two targets
// vertical puts a selection on each line vertically between the two targets
export type RangeType = "continuous" | "vertical";

export interface ListTarget {
  type: "list";
  elements: (PrimitiveTarget | RangeTarget)[];
}

export type Target = PrimitiveTarget | RangeTarget | ListTarget;
