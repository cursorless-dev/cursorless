const HAT_COLORS = [
  "default",
  "blue",
  "green",
  "red",
  "pink",
  "yellow",
  "userColor1",
  "userColor2",
] as const;

const HAT_NON_DEFAULT_SHAPES = [
  "ex",
  "fox",
  "wing",
  "hole",
  "frame",
  "curve",
  "eye",
  "play",
  "bolt",
  "wrench",
  "crosshairs",
  "bridge",
  "church",
  "fang",
  "cone",
  "gem",
  "horn",
  "knight",
  "leaf",
  "meeple",
  "moon",
  "mosque",
  "pail",
  "rook",
  "shroom",
  "singer",
  "stair",
  "stupa",
  "wave",
  "star",
  "gate",
] as const;

type HatColor = (typeof HAT_COLORS)[number];
type HatNonDefaultShape = (typeof HAT_NON_DEFAULT_SHAPES)[number];
type HatStyleName = HatColor | `${HatColor}-${HatNonDefaultShape}`;

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
  symbolColor: HatStyleName;
  character: string;
}

type LineNumberType = "absolute" | "relative" | "modulo100";

export interface LineNumberPositionV2 {
  type: LineNumberType;
  lineNumber: number;
}

export interface LineNumberMarkV2 {
  type: "lineNumber";
  anchor: LineNumberPositionV2;
  active: LineNumberPositionV2;
}

export type MarkV2 =
  | CursorMark
  | ThatMark
  | SourceMark
  //   | LastCursorPositionMark Not implemented yet
  | DecoratedSymbolMark
  | NothingMark
  | LineNumberMarkV2;

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

export type SimpleScopeTypeTypeV2 =
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

interface SimpleScopeType {
  type: SimpleScopeTypeTypeV2;
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

export type ScopeTypeV2 =
  | SimpleScopeType
  | SurroundingPairScopeType
  | CustomRegexScopeType;

interface InteriorOnlyModifier {
  type: "interiorOnly";
}

interface ExcludeInteriorModifier {
  type: "excludeInterior";
}

interface ContainingScopeModifier {
  type: "containingScope";
  scopeType: ScopeTypeV2;
}

interface EveryScopeModifier {
  type: "everyScope";
  scopeType: ScopeTypeV2;
}

export interface OrdinalRangeModifierV2 {
  type: "ordinalRange";
  scopeType: ScopeTypeV2;
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
interface RawSelectionModifier {
  type: "toRawSelection";
}

interface LeadingModifier {
  type: "leading";
}

interface TrailingModifier {
  type: "trailing";
}

type Position = "before" | "after" | "start" | "end";

interface PositionModifier {
  type: "position";
  position: Position;
}

export interface PartialPrimitiveTargetDescriptorV2 {
  type: "primitive";
  mark?: MarkV2;
  modifiers?: ModifierV2[];
  isImplicit?: boolean;
}

interface HeadTailModifier {
  type: "extendThroughStartOf" | "extendThroughEndOf";
  modifiers?: ModifierV2[];
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
  modifier: ModifierV2;
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
  modifiers: ModifierV2[];
}

export type ModifierV2 =
  | PositionModifier
  | InteriorOnlyModifier
  | ExcludeInteriorModifier
  | ContainingScopeModifier
  | EveryScopeModifier
  | OrdinalRangeModifierV2
  | HeadTailModifier
  | LeadingModifier
  | TrailingModifier
  | RawSelectionModifier
  | ModifyIfUntypedModifier
  | CascadingModifier;

export interface PartialRangeTargetDescriptorV2 {
  type: "range";
  anchor: PartialPrimitiveTargetDescriptorV2;
  active: PartialPrimitiveTargetDescriptorV2;
  excludeAnchor: boolean;
  excludeActive: boolean;
  rangeType?: RangeType;
}

export interface PartialListTargetDescriptorV2 {
  type: "list";
  elements: (
    | PartialPrimitiveTargetDescriptorV2
    | PartialRangeTargetDescriptorV2
  )[];
}

export type PartialTargetDescriptorV2 =
  | PartialPrimitiveTargetDescriptorV2
  | PartialRangeTargetDescriptorV2
  | PartialListTargetDescriptorV2;

// continuous is one single continuous selection between the two targets
// vertical puts a selection on each line vertically between the two targets

type RangeType = "continuous" | "vertical";
