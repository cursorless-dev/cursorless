import { HatStyleName } from "../core/constants";

export interface CursorMark {
  type: "cursor";
}

export interface ThatMark {
  type: "that";
}

export interface SourceMark {
  type: "source";
}

export interface NothingMark {
  type: "nothing";
}

export interface LastCursorPositionMark {
  type: "lastCursorPosition";
}

export interface DecoratedSymbolMark {
  type: "decoratedSymbol";
  symbolColor: HatStyleName;
  character: string;
}

export type LineNumberType = "absolute" | "relative" | "modulo100";

export interface LineNumberPosition {
  type: LineNumberType;
  lineNumber: number;
}

export interface LineNumberMark {
  type: "lineNumber";
  anchor: LineNumberPosition;
  active: LineNumberPosition;
}

export type Mark =
  | CursorMark
  | ThatMark
  | SourceMark
  //   | LastCursorPositionMark Not implemented yet
  | DecoratedSymbolMark
  | NothingMark
  | LineNumberMark;

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

export type SimpleScopeTypeType =
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
  | "token"
  | "line"
  | "notebookCell"
  | "paragraph"
  | "document"
  | "character"
  | "word"
  | "nonWhitespaceSequence"
  | "url";

export interface SimpleScopeType {
  type: SimpleScopeTypeType;
}

export type SurroundingPairDirection = "left" | "right";
export interface SurroundingPairScopeType {
  type: "surroundingPair";
  delimiter: SurroundingPairName;
  forceDirection?: SurroundingPairDirection;
}

export type ScopeType = SimpleScopeType | SurroundingPairScopeType;

export interface ContainingSurroundingPairModifier
  extends ContainingScopeModifier {
  scopeType: SurroundingPairScopeType;
}

export interface InteriorOnlyModifier {
  type: "interiorOnly";
}

export interface ExcludeInteriorModifier {
  type: "excludeInterior";
}

export interface ContainingScopeModifier {
  type: "containingScope";
  scopeType: ScopeType;
}

export interface EveryScopeModifier {
  type: "everyScope";
  scopeType: ScopeType;
}

export interface OrdinalRangeModifier {
  type: "ordinalRange";
  scopeType: ScopeType;
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
  type: "extendThroughStartOf";
}

export interface TailModifier {
  type: "extendThroughEndOf";
}

export interface LeadingModifier {
  type: "leading";
}

export interface TrailingModifier {
  type: "trailing";
}

export type Position = "before" | "after" | "start" | "end";

export interface PositionModifier {
  type: "position";
  position: Position;
}

export interface PartialPrimitiveTargetDescriptor {
  type: "primitive";
  mark?: Mark;
  modifiers?: Modifier[];
  isImplicit?: boolean;
}

export type Modifier =
  | PositionModifier
  | InteriorOnlyModifier
  | ExcludeInteriorModifier
  | ContainingScopeModifier
  | EveryScopeModifier
  | OrdinalRangeModifier
  | HeadModifier
  | TailModifier
  | LeadingModifier
  | TrailingModifier
  | RawSelectionModifier;

export interface PartialRangeTargetDescriptor {
  type: "range";
  anchor: PartialPrimitiveTargetDescriptor;
  active: PartialPrimitiveTargetDescriptor;
  excludeAnchor: boolean;
  excludeActive: boolean;
  rangeType?: RangeType;
}

export interface PartialListTargetDescriptor {
  type: "list";
  elements: (PartialPrimitiveTargetDescriptor | PartialRangeTargetDescriptor)[];
}

export type PartialTargetDescriptor =
  | PartialPrimitiveTargetDescriptor
  | PartialRangeTargetDescriptor
  | PartialListTargetDescriptor;

export interface PrimitiveTargetDescriptor
  extends PartialPrimitiveTargetDescriptor {
  /**
   * The mark, eg "air", "this", "that", etc
   */
  mark: Mark;

  /**
   * Zero or more modifiers that will be applied in sequence to the output from
   * the mark.  Note that the modifiers will be applied in reverse order.  For
   * example, if the user says "take first char name air", then we will apply
   * "name" to the output of "air" to select the name of the function or
   * statement containing "air", then apply "first char" to select the first
   * character of the name.
   */
  modifiers: Modifier[];
}

export interface RangeTargetDescriptor {
  type: "range";
  anchor: PrimitiveTargetDescriptor;
  active: PrimitiveTargetDescriptor;
  excludeAnchor: boolean;
  excludeActive: boolean;
  rangeType: RangeType;
}
// continuous is one single continuous selection between the two targets
// vertical puts a selection on each line vertically between the two targets

export type RangeType = "continuous" | "vertical";

export interface ListTargetDescriptor {
  type: "list";
  elements: (PrimitiveTargetDescriptor | RangeTargetDescriptor)[];
}

export type TargetDescriptor =
  | PrimitiveTargetDescriptor
  | RangeTargetDescriptor
  | ListTargetDescriptor;
