export interface CommandV1 extends CommandV0V1 {
  version: 1;
}

export interface CommandV0 extends CommandV0V1 {
  version: 0;
  usePrePhraseSnapshot?: false;
}

interface CommandV0V1 {
  /**
   * The version number of the command API
   */
  version: 0 | 1;

  /**
   * The spoken form of the command if issued from a voice command system
   */
  spokenForm?: string;

  /**
   * If the command is issued from a voice command system, this boolean indicates
   * whether we should use the pre phrase snapshot. Only set this to true if the
   * voice command system issues a pre phrase signal at the start of every
   * phrase.
   */
  usePrePhraseSnapshot?: boolean;

  /**
   * The action to run
   */
  action: string;

  /**
   * A list of targets expected by the action. Inference will be run on the
   * targets
   */
  targets: PartialTargetV0V1[];

  /**
   * A list of extra arguments expected by the given action.
   */
  extraArgs?: unknown[];
}

interface PartialPrimitiveTarget {
  type: "primitive";
  mark?: Mark;
  modifier?: Modifier;
  selectionType?: SelectionType;
  position?: Position;
  insideOutsideType?: InsideOutsideType;
  isImplicit?: boolean;
}

interface PartialRangeTarget {
  type: "range";
  start: PartialPrimitiveTarget;
  end: PartialPrimitiveTarget;
  excludeStart?: boolean;
  excludeEnd?: boolean;
  rangeType?: RangeType;
}

type RangeType = "continuous" | "vertical";

interface PartialListTarget {
  type: "list";
  elements: (PartialPrimitiveTarget | PartialRangeTarget)[];
}

export type PartialTargetV0V1 =
  | PartialPrimitiveTarget
  | PartialRangeTarget
  | PartialListTarget;

type SelectionType =
  | "token"
  | "line"
  | "notebookCell"
  | "paragraph"
  | "document"
  | "nonWhitespaceSequence"
  | "url";

interface CursorMark {
  type: "cursor";
}

interface CursorMarkToken {
  type: "cursorToken";
}

interface That {
  type: "that";
}

interface Source {
  type: "source";
}

interface Nothing {
  type: "nothing";
}

interface DecoratedSymbol {
  type: "decoratedSymbol";
  // NB: We use the type string instead of the more specific hat style type
  // because this will go through a canonicalization mapping anyway
  symbolColor: string;
  character: string;
}

type LineNumberType = "absolute" | "relative" | "modulo100";

interface LineNumberPosition {
  type: LineNumberType;
  lineNumber: number;
}

interface LineNumber {
  type: "lineNumber";
  anchor: LineNumberPosition;
  active: LineNumberPosition;
}

type Mark =
  | CursorMark
  | CursorMarkToken
  | That
  | Source
  | DecoratedSymbol
  | Nothing
  | LineNumber;

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

type ComplexSurroundingPairName = "string" | "any";

type SurroundingPairName =
  | SimpleSurroundingPairName
  | ComplexSurroundingPairName;

type ScopeType = string;

type Position = "before" | "after" | "contents";

type InsideOutsideType = "inside" | "outside" | null;

type SubTokenType = "word" | "character";

/**
 * Indicates whether to include or exclude delimiters in a surrounding pair
 * modifier. In the future, these will become proper modifiers that can be
 * applied in many places, such as to restrict to the body of an if statement.
 * By default, a surrounding pair modifier refers to the entire surrounding
 * range, so if delimiter inclusion is undefined, it's equivalent to not having
 * one of these modifiers; ie include the delimiters.
 */

type DelimiterInclusion = "excludeInterior" | "interiorOnly" | undefined;

type SurroundingPairDirection = "left" | "right";

interface SurroundingPairModifier {
  type: "surroundingPair";
  delimiter: SurroundingPairName;
  delimiterInclusion: DelimiterInclusion;
  forceDirection?: SurroundingPairDirection;
}

interface ContainingScopeModifier {
  type: "containingScope";
  scopeType: ScopeType;
  valueOnly?: boolean;
  includeSiblings?: boolean;
}

interface SubTokenModifier {
  type: "subpiece";
  pieceType: SubTokenType;
  anchor: number;
  active: number;
  excludeAnchor?: boolean;
  excludeActive?: boolean;
}

interface IdentityModifier {
  type: "identity";
}

/**
 * Converts its input to a raw selection with no type information so for
 * example if it is the destination of a bring or move it should inherit the
 * type information such as delimiters from its source.
 */

interface RawSelectionModifier {
  type: "toRawSelection";
}

interface HeadModifier {
  type: "head";
}

interface TailModifier {
  type: "tail";
}

type Modifier =
  | IdentityModifier
  | SurroundingPairModifier
  | ContainingScopeModifier
  | SubTokenModifier
  | HeadModifier
  | TailModifier
  | RawSelectionModifier;
