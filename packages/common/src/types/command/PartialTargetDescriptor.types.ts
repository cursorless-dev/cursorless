export interface CursorMark {
  type: "cursor";
}

export interface ThatMark {
  type: "that";
}

export interface KeyboardMark {
  type: "keyboard";
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

export type SimplePartialMark =
  | ThatMark
  | KeyboardMark
  | SourceMark
  | NothingMark
  | LastCursorPositionMark;

export interface DecoratedSymbolMark {
  type: "decoratedSymbol";
  symbolColor: string;
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
export interface RangeMarkFor<T> {
  type: "range";
  anchor: T;
  active: T;
  excludeAnchor: boolean;
  excludeActive: boolean;
}

export type PartialRangeMark = RangeMarkFor<PartialMark>;

interface SimplePosition {
  readonly line: number;
  readonly character: number;
}

interface SimpleRange {
  readonly start: SimplePosition;
  readonly end: SimplePosition;
}

/**
 * Used to explicitly provide a range for use as a mark. Today, this mark type
 * is only used as a hack to enable us to support allowing other editors to
 * maintain their own hat map when using the Cursorless "sidecar"; see
 * https://github.com/cursorless-everywhere/notes for more information.
 */
export interface ExplicitMark {
  type: "explicit";
  editorId: string;
  range: SimpleRange;
}

/**
 * Can be used when constructing a primitive target that applies modifiers to
 * the output of some other complex target descriptor.  For example, we use this
 * to apply the hoisted modifiers to the output of a range target when we hoist
 * the "every funk" modifier on a command like "take every funk air until bat".
 */
export interface PartialTargetMark {
  type: "target";

  /**
   * The target descriptor that will be used to generate the targets output by
   * this mark.
   */
  target: PartialTargetDescriptor;
}

export type PartialMark =
  | CursorMark
  | ThatMark
  | SourceMark
  | KeyboardMark
  | DecoratedSymbolMark
  | NothingMark
  | LineNumberMark
  | PartialRangeMark
  | ExplicitMark
  | PartialTargetMark;

export const simpleSurroundingPairNames = [
  "angleBrackets",
  "backtickQuotes",
  "curlyBrackets",
  "doubleQuotes",
  "escapedDoubleQuotes",
  "escapedParentheses",
  "escapedSingleQuotes",
  "escapedSquareBrackets",
  "parentheses",
  "singleQuotes",
  "squareBrackets",
  "tripleDoubleQuotes",
  "tripleSingleQuotes",
] as const;
export const complexSurroundingPairNames = [
  "string",
  "any",
  "collectionBoundary",
] as const;
export const surroundingPairNames = [
  ...simpleSurroundingPairNames,
  ...complexSurroundingPairNames,
];
export type SimpleSurroundingPairName =
  (typeof simpleSurroundingPairNames)[number];
export type ComplexSurroundingPairName =
  (typeof complexSurroundingPairNames)[number];
export type SurroundingPairName =
  | SimpleSurroundingPairName
  | ComplexSurroundingPairName;

export const simpleScopeTypeTypes = [
  "argumentOrParameter",
  "anonymousFunction",
  "attribute",
  "branch",
  "class",
  "className",
  "collectionItem",
  "collectionKey",
  "comment",
  "private.fieldAccess",
  "functionCall",
  "functionCallee",
  "functionName",
  "ifStatement",
  "instance",
  "list",
  "map",
  "name",
  "namedFunction",
  "regularExpression",
  "statement",
  "string",
  "type",
  "value",
  "condition",
  "section",
  "sectionLevelOne",
  "sectionLevelTwo",
  "sectionLevelThree",
  "sectionLevelFour",
  "sectionLevelFive",
  "sectionLevelSix",
  "selector",
  "private.switchStatementSubject",
  "unit",
  "xmlBothTags",
  "xmlElement",
  "xmlEndTag",
  "xmlStartTag",
  // Latex scope types
  "part",
  "chapter",
  "subSection",
  "subSubSection",
  "namedParagraph",
  "subParagraph",
  "environment",
  // Text based scopes
  "character",
  "word",
  "token",
  "identifier",
  "line",
  "sentence",
  "paragraph",
  "boundedParagraph",
  "document",
  "nonWhitespaceSequence",
  "boundedNonWhitespaceSequence",
  "url",
  "notebookCell",
  // Talon
  "command",
  // Private scope types
  "textFragment",
  "disqualifyDelimiter",
  "pairDelimiter",
] as const;

export function isSimpleScopeType(
  scopeType: ScopeType,
): scopeType is SimpleScopeType {
  return (simpleScopeTypeTypes as readonly string[]).includes(scopeType.type);
}

export type SimpleScopeTypeType = (typeof simpleScopeTypeTypes)[number];

export interface SimpleScopeType {
  type: SimpleScopeTypeType;
}

export interface CustomRegexScopeType {
  type: "customRegex";
  regex: string;
  flags?: string;
}

export type SurroundingPairDirection = "left" | "right";

export interface SurroundingPairScopeType {
  type: "surroundingPair";
  delimiter: SurroundingPairName;

  /**
   * @deprecated Not supported by next-gen surrounding pairs; we don't believe
   * anyone uses this
   */
  forceDirection?: SurroundingPairDirection;

  /**
   * If `true`, then only accept pairs where the pair completely contains the
   * selection, ie without the edges touching.
   */
  requireStrongContainment?: boolean;
}

/**
 * This differs from the normal @SurroundingPairScopeType that it always
 * uses `requireStrongContainment` and the content range is the pair interior
 * */
export interface SurroundingPairInteriorScopeType {
  type: "surroundingPairInterior";
  delimiter: SurroundingPairName;
  // If true don't yield multiline pairs
  requireSingleLine?: boolean;
}

export interface OneOfScopeType {
  type: "oneOf";
  scopeTypes: ScopeType[];
}

export interface GlyphScopeType {
  type: "glyph";
  character: string;
}

export type ScopeType =
  | SimpleScopeType
  | SurroundingPairScopeType
  | SurroundingPairInteriorScopeType
  | CustomRegexScopeType
  | OneOfScopeType
  | GlyphScopeType;

export interface ContainingSurroundingPairModifier
  extends ContainingScopeModifier {
  scopeType: SurroundingPairScopeType;
}

export interface EverySurroundingPairModifier extends EveryScopeModifier {
  scopeType: SurroundingPairScopeType;
}

export type SurroundingPairModifier =
  | ContainingSurroundingPairModifier
  | EverySurroundingPairModifier;

export interface InteriorOnlyModifier {
  type: "interiorOnly";
}

export interface ExcludeInteriorModifier {
  type: "excludeInterior";
}

export interface VisibleModifier {
  type: "visible";
}

export interface ContainingScopeModifier {
  type: "containingScope";
  scopeType: ScopeType;
  ancestorIndex?: number;
}

export interface PreferredScopeModifier {
  type: "preferredScope";
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

  /** If true, yields individual targets instead of contiguous range. Defaults to `false` */
  isEvery?: boolean;
}

export type Direction = "forward" | "backward";

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
  direction: Direction;

  /** If true use individual targets instead of combined range */
  isEvery?: boolean;
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

export interface StartOfModifier {
  type: "startOf";
}

export interface EndOfModifier {
  type: "endOf";
}

export interface HeadModifier {
  type: "extendThroughStartOf";
  modifiers?: Modifier[];
}

export interface TailModifier {
  type: "extendThroughEndOf";
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
  excludeAnchor: boolean;
  excludeActive: boolean;
}

export type Modifier =
  | StartOfModifier
  | EndOfModifier
  | InteriorOnlyModifier
  | ExcludeInteriorModifier
  | VisibleModifier
  | ContainingScopeModifier
  | PreferredScopeModifier
  | EveryScopeModifier
  | OrdinalScopeModifier
  | RelativeScopeModifier
  | HeadModifier
  | TailModifier
  | LeadingModifier
  | TrailingModifier
  | RawSelectionModifier
  | ModifyIfUntypedModifier
  | CascadingModifier
  | RangeModifier
  | KeepContentFilterModifier
  | KeepEmptyFilterModifier
  | InferPreviousMarkModifier;

export type ModifierType = Modifier["type"];

// continuous is one single continuous selection between the two targets
// vertical puts a selection on each line vertically between the two targets
export type PartialRangeType = "continuous" | "vertical";

export interface PartialPrimitiveTargetDescriptor {
  type: "primitive";
  mark?: PartialMark;
  modifiers?: Modifier[];
}

export interface PartialRangeTargetDescriptor {
  type: "range";
  anchor: PartialPrimitiveTargetDescriptor | ImplicitTargetDescriptor;
  active: PartialPrimitiveTargetDescriptor;
  excludeAnchor: boolean;
  excludeActive: boolean;
  rangeType?: PartialRangeType;
}

export interface PartialListTargetDescriptor {
  type: "list";
  elements: (PartialPrimitiveTargetDescriptor | PartialRangeTargetDescriptor)[];
}

export interface ImplicitTargetDescriptor {
  type: "implicit";
}

export type PartialTargetDescriptor =
  | PartialPrimitiveTargetDescriptor
  | PartialRangeTargetDescriptor
  | PartialListTargetDescriptor
  | ImplicitTargetDescriptor;
