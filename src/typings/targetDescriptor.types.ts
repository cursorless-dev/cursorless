import { HatStyleName } from "../core/hatStyles";
// FIXME: See microsoft/TypeScript#43869
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Target } from "./target.types";

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

export interface LineNumberMark {
  type: "lineNumber";
  lineNumberType: LineNumberType;
  lineNumber: number;
}

/**
 * Constructs a range between {@link anchor} and {@link active}
 */
export interface RangeMark {
  type: "range";
  anchor: Mark;
  active: Mark;
  excludeAnchor?: boolean;
  excludeActive?: boolean;
}

export type Mark =
  | CursorMark
  | ThatMark
  | SourceMark
  | DecoratedSymbolMark
  | NothingMark
  | LineNumberMark
  | RangeMark;

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
export type ComplexSurroundingPairName =
  | "string"
  | "any"
  | "collectionBoundary";
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
  | "functionCallee"
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
  | "unit"
  | "xmlBothTags"
  | "xmlElement"
  | "xmlEndTag"
  | "xmlStartTag"
  // Latex scope types
  | "part"
  | "chapter"
  | "subSection"
  | "subSubSection"
  | "namedParagraph"
  | "subParagraph"
  | "environment"
  // Text based scopes
  | "token"
  | "line"
  | "notebookCell"
  | "paragraph"
  | "document"
  | "character"
  | "word"
  | "nonWhitespaceSequence"
  | "boundedNonWhitespaceSequence"
  | "url";

export interface SimpleScopeType {
  type: SimpleScopeTypeType;
}

export interface CustomRegexScopeType {
  type: "customRegex";
  regex: string;
}

export type SurroundingPairDirection = "left" | "right";
export interface SurroundingPairScopeType {
  type: "surroundingPair";
  delimiter: SurroundingPairName;
  forceDirection?: SurroundingPairDirection;

  /**
   * If `true`, then only accept pairs where the pair completely contains the
   * selection, ie without the edges touching.
   */
  requireStrongContainment?: boolean;
}

export type ScopeType =
  | SimpleScopeType
  | SurroundingPairScopeType
  | CustomRegexScopeType;

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

/**
 * Refer to scopes by absolute index relative to iteration scope, eg "first
 * funk" to refer to the first function in a class.
 */
export interface OrdinalScopeModifier {
  type: "ordinalScope";

  scopeType: ScopeType;

  /** The start of the range.  Start from end of iteration scope if `start` is negative */
  start: number;

  /** The number of scopes to include.  Will always be positive.  If greater than 1, will include scopes after {@link start} */
  length: number;
}

/**
 * Refer to scopes by offset relative to input target, eg "next
 * funk" to refer to the first function after the function containing the target input.
 */
export interface RelativeScopeModifier {
  type: "relativeScope";

  scopeType: ScopeType;

  /** Indicates how many scopes away to start relative to the input target.
   * Note that if {@link direction} is `"backward"`, then this scope will be the
   * end of the output range.  */
  offset: number;

  /** The number of scopes to include.  Will always be positive.  If greater
   * than 1, will include scopes in the direction of {@link direction} */
  length: number;

  /** Indicates which direction both {@link offset} and {@link length} go
   * relative to input target  */
  direction: "forward" | "backward";
}

/**
 * Converts its input to a raw selection with no type information so for
 * example if it is the destination of a bring or move it should inherit the
 * type information such as delimiters from its source.
 */
export interface RawSelectionModifier {
  type: "toRawSelection";
}

export interface LeadingModifier {
  type: "leading";
}

export interface TrailingModifier {
  type: "trailing";
}

export interface KeepContentFilterModifier {
  type: "keepContentFilter";
}

export interface KeepEmptyFilterModifier {
  type: "keepEmptyFilter";
}

export interface InferPreviousMarkModifier {
  type: "inferPreviousMark";
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

export interface HeadTailModifier {
  type: "extendThroughStartOf" | "extendThroughEndOf";
  modifiers?: Modifier[];
}

/**
 * Runs {@link modifier} if the target has no explicit scope type, ie if
 * {@link Target.hasExplicitScopeType} is `false`.
 */
export interface ModifyIfUntypedModifier {
  type: "modifyIfUntyped";

  /**
   * The modifier to apply if the target is untyped
   */
  modifier: Modifier;
}

/**
 * Tries each of the modifiers in {@link modifiers} in turn until one of them
 * doesn't throw an error, returning the output from the first modifier not
 * throwing an error.
 */
export interface CascadingModifier {
  type: "cascading";

  /**
   * The modifiers to try in turn
   */
  modifiers: Modifier[];
}

/**
 * First applies {@link anchor} to input, then independently applies
 * {@link active}, and forms a range between the two resulting targets
 */
export interface RangeModifier {
  type: "range";
  anchor: Modifier;
  active: Modifier;
  excludeAnchor?: boolean;
  excludeActive?: boolean;
}

export type Modifier =
  | PositionModifier
  | InteriorOnlyModifier
  | ExcludeInteriorModifier
  | ContainingScopeModifier
  | EveryScopeModifier
  | OrdinalScopeModifier
  | RelativeScopeModifier
  | HeadTailModifier
  | LeadingModifier
  | TrailingModifier
  | RawSelectionModifier
  | ModifyIfUntypedModifier
  | CascadingModifier
  | RangeModifier
  | KeepContentFilterModifier
  | KeepEmptyFilterModifier
  | InferPreviousMarkModifier;

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

  /**
   * We separate the positional modifier from the other modifiers because it
   * behaves differently and and makes the target behave like a destination for
   * example for bring.  This change is the first step toward #803
   */
  positionModifier?: PositionModifier;
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
