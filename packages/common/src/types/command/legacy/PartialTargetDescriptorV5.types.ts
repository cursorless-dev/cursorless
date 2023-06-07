interface CursorMark {
  type: "cursor";
}

interface ThatMark {
  type: "that";
}

interface SourceMark {
  type: "source";
}

interface NothingMark {
  type: "nothing";
}

interface DecoratedSymbolMark {
  type: "decoratedSymbol";
  symbolColor: string;
  character: string;
}

type LineNumberType = "absolute" | "relative" | "modulo100";

interface LineNumberMark {
  type: "lineNumber";
  lineNumberType: LineNumberType;
  lineNumber: number;
}

/**
 * Constructs a range between {@link anchor} and {@link active}
 */
interface RangeMark {
  type: "range";
  anchor: PartialMark;
  active: PartialMark;
  excludeAnchor?: boolean;
  excludeActive?: boolean;
}

type PartialMark =
  | CursorMark
  | ThatMark
  | SourceMark
  | DecoratedSymbolMark
  | NothingMark
  | LineNumberMark
  | RangeMark;

type SimpleSurroundingPairName =
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
type ComplexSurroundingPairName = "string" | "any" | "collectionBoundary";
type SurroundingPairName =
  | SimpleSurroundingPairName
  | ComplexSurroundingPairName;

export type SimpleScopeTypeTypeV5 =
  | "argumentOrParameter"
  | "anonymousFunction"
  | "attribute"
  | "branch"
  | "class"
  | "className"
  | "collectionItem"
  | "collectionKey"
  | "comment"
  | "functionCall"
  | "functionCallee"
  | "functionName"
  | "ifStatement"
  | "instance"
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
  | "switchStatementSubject"
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
  | "identifier"
  | "nonWhitespaceSequence"
  | "boundedNonWhitespaceSequence"
  | "url";

interface SimpleScopeTypeV5 {
  type: SimpleScopeTypeTypeV5;
}

interface CustomRegexScopeType {
  type: "customRegex";
  regex: string;
}

type SurroundingPairDirection = "left" | "right";
interface SurroundingPairScopeType {
  type: "surroundingPair";
  delimiter: SurroundingPairName;
  forceDirection?: SurroundingPairDirection;

  /**
   * If `true`, then only accept pairs where the pair completely contains the
   * selection, ie without the edges touching.
   */
  requireStrongContainment?: boolean;
}

interface OneOfScopeType {
  type: "oneOf";
  scopeTypes: ScopeTypeV5[];
}

export type ScopeTypeV5 =
  | SimpleScopeTypeV5
  | SurroundingPairScopeType
  | CustomRegexScopeType
  | OneOfScopeType;

interface InteriorOnlyModifier {
  type: "interiorOnly";
}

interface ExcludeInteriorModifier {
  type: "excludeInterior";
}

export interface ContainingScopeModifierV5 {
  type: "containingScope";
  scopeType: ScopeTypeV5;
  ancestorIndex?: number;
}

export interface EveryScopeModifierV5 {
  type: "everyScope";
  scopeType: ScopeTypeV5;
}

/**
 * Refer to scopes by absolute index relative to iteration scope, eg "first
 * funk" to refer to the first function in a class.
 */
export interface OrdinalScopeModifierV5 {
  type: "ordinalScope";

  scopeType: ScopeTypeV5;

  /** The start of the range.  Start from end of iteration scope if `start` is negative */
  start: number;

  /** The number of scopes to include.  Will always be positive.  If greater than 1, will include scopes after {@link start} */
  length: number;
}

type Direction = "forward" | "backward";

/**
 * Refer to scopes by offset relative to input target, eg "next
 * funk" to refer to the first function after the function containing the target input.
 */
export interface RelativeScopeModifierV5 {
  type: "relativeScope";

  scopeType: ScopeTypeV5;

  /** Indicates how many scopes away to start relative to the input target.
   * Note that if {@link direction} is `"backward"`, then this scope will be the
   * end of the output range.  */
  offset: number;

  /** The number of scopes to include.  Will always be positive.  If greater
   * than 1, will include scopes in the direction of {@link direction} */
  length: number;

  /** Indicates which direction both {@link offset} and {@link length} go
   * relative to input target  */
  direction: Direction;
}

/**
 * Converts its input to a raw selection with no type information so for
 * example if it is the destination of a bring or move it should inherit the
 * type information such as delimiters from its source.
 */
interface RawSelectionModifier {
  type: "toRawSelection";
}

interface LeadingModifier {
  type: "leading";
}

interface TrailingModifier {
  type: "trailing";
}

interface KeepContentFilterModifier {
  type: "keepContentFilter";
}

interface KeepEmptyFilterModifier {
  type: "keepEmptyFilter";
}

interface InferPreviousMarkModifier {
  type: "inferPreviousMark";
}

type TargetPosition = "before" | "after" | "start" | "end";

interface PositionModifier {
  type: "position";
  position: TargetPosition;
}

export interface PartialPrimitiveTargetDescriptorV5 {
  type: "primitive";
  mark?: PartialMark;
  modifiers?: ModifierV5[];
}

interface HeadTailModifier {
  type: "extendThroughStartOf" | "extendThroughEndOf";
  modifiers?: ModifierV5[];
}

/**
 * Runs {@link modifier} if the target has no explicit scope type, ie if
 * {@link Target.hasExplicitScopeType} is `false`.
 */
interface ModifyIfUntypedModifier {
  type: "modifyIfUntyped";

  /**
   * The modifier to apply if the target is untyped
   */
  modifier: ModifierV5;
}

/**
 * Tries each of the modifiers in {@link modifiers} in turn until one of them
 * doesn't throw an error, returning the output from the first modifier not
 * throwing an error.
 */
interface CascadingModifier {
  type: "cascading";

  /**
   * The modifiers to try in turn
   */
  modifiers: ModifierV5[];
}

/**
 * First applies {@link anchor} to input, then independently applies
 * {@link active}, and forms a range between the two resulting targets
 */
interface RangeModifier {
  type: "range";
  anchor: ModifierV5;
  active: ModifierV5;
  excludeAnchor?: boolean;
  excludeActive?: boolean;
}

export type ModifierV5 =
  | PositionModifier
  | InteriorOnlyModifier
  | ExcludeInteriorModifier
  | ContainingScopeModifierV5
  | EveryScopeModifierV5
  | OrdinalScopeModifierV5
  | RelativeScopeModifierV5
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

// continuous is one single continuous selection between the two targets
// vertical puts a selection on each line vertically between the two targets
type PartialRangeType = "continuous" | "vertical";

export interface PartialRangeTargetDescriptorV5 {
  type: "range";
  anchor: PartialPrimitiveTargetDescriptorV5 | ImplicitTargetDescriptorV5;
  active: PartialPrimitiveTargetDescriptorV5;
  excludeAnchor: boolean;
  excludeActive: boolean;
  rangeType?: PartialRangeType;
}

export interface PartialListTargetDescriptorV5 {
  type: "list";
  elements: (
    | PartialPrimitiveTargetDescriptorV5
    | PartialRangeTargetDescriptorV5
  )[];
}

export interface ImplicitTargetDescriptorV5 {
  type: "implicit";
}

export type PartialTargetDescriptorV5 =
  | PartialPrimitiveTargetDescriptorV5
  | PartialRangeTargetDescriptorV5
  | PartialListTargetDescriptorV5
  | ImplicitTargetDescriptorV5;
