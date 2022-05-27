import { Range, Selection, TextEditor } from "vscode";
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

export interface PartialPrimitiveTargetDesc {
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
  | RawSelectionModifier;

export interface PartialRangeTargetDesc {
  type: "range";
  anchor: PartialPrimitiveTargetDesc;
  active: PartialPrimitiveTargetDesc;
  excludeAnchor: boolean;
  excludeActive: boolean;
  rangeType?: RangeType;
}

export interface PartialListTargetDesc {
  type: "list";
  elements: (PartialPrimitiveTargetDesc | PartialRangeTargetDesc)[];
}

export type PartialTargetDesc =
  | PartialPrimitiveTargetDesc
  | PartialRangeTargetDesc
  | PartialListTargetDesc;

export interface PrimitiveTargetDescriptor extends PartialPrimitiveTargetDesc {
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

export interface RemovalRange {
  /** The range to be removed  */
  range: Range;
  /** Optional highlight range to be used for highlight instead of the removal range  */
  highlight?: Range;
  /** If true this range is excluded from delimiters by default  */
  exclude?: boolean;
}

export interface EditNewCommandContext {
  type: "command";
  command: string;
  dontUpdateSelection?: boolean;
}
export interface EditNewDelimiterContext {
  type: "delimiter";
  delimiter: string;
}

export type EditNewContext = EditNewCommandContext | EditNewDelimiterContext;

export interface Target {
  /** The text editor used for all ranges */
  readonly editor: TextEditor;

  /** If true active is before anchor */
  readonly isReversed: boolean;

  /** The range of the content */
  readonly contentRange: Range;

  /** If this selection has a delimiter. For example, new line for a line or paragraph and comma for a list or argument */
  readonly delimiter?: string;

  /** The range to remove the content */
  readonly removalRange?: Range;

  /** The range of the delimiter before the content selection */
  readonly leadingDelimiter?: RemovalRange;

  /** The range of the delimiter after the content selection */
  readonly trailingDelimiter?: RemovalRange;

  /** The current position */
  readonly position?: Position;

  /** If true this target should be treated as a line */
  readonly isLine: boolean;

  /** If true this target should be treated as a paragraph */
  readonly isParagraph: boolean;

  /** If true this target is of weak type and should use inference/upgrade when needed. See {@link WeakTarget} for more info  */
  readonly isWeak: boolean;

  readonly contentText: string;
  readonly contentSelection: Selection;
  readonly thatTarget: Target;

  getInteriorStrict(): Target[];
  getBoundaryStrict(): Target[];
  maybeAddDelimiter(text: string): string;
  getRemovalRange(): Range;
  getRemovalHighlightRange(): Range | undefined;
  getEditNewContext(isBefore: boolean): EditNewContext;
  withPosition(position: Position): Target;
  withThatTarget(thatTarget: Target): Target;
}
